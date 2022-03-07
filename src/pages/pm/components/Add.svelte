<script>
    import { createEventDispatcher, onMount } from 'svelte'
    const dispatch = createEventDispatcher();
    onMount(() => window.scrollTo(0, 0));
    import Cancel from "../../../assets/Cancel.svelte";
    import {firestore, PROJECTS, TASKS, FIELD_VALUE, NOTE} from "../../../firebase";
    import showdown from "showdown";
    export let user;
    export let editProject;
    export let tasks;
    export let note;

    let project = editProject ? editProject : {
        name: "",
        created: new Date(),
        id: PROJECTS.doc().id,
        description: "",
        tags: [],
        users: [user.uid],
    };
    if (editProject) {
        project.milestones.forEach((m, i) => project.milestones[i].todos = [])
        project.name = new showdown.Converter().makeMarkdown(project.name)
        tasks.forEach( tsk => {
            let task = Object.assign(tsk, {});
            if (!project.milestones[task.milestone].todos)
                project.milestones[task.milestone].todos = []
            if (task.expiry) task.expiry = new Date(task.expiry.seconds*1000)
            project.milestones[task.milestone].todos.push(task);
            if (task.expiry!==null)
                console.log(task.expiry.getDate())
        })
    }

    let todo = ""
    let milestone = {
        name: "",
        description: "",
        tag: [],
        users: [],
        budget: "",
        expiry: "",
        todos: []
    }

    let steps = editProject ? 1 : 0;

    const addTodo = () => {
        if (todo.length<0) return
        let fTags = [];
        todo = new showdown.Converter().makeHtml(todo)
        let tags = todo.split(" ").filter(n => /:/.test(n));
        let expiry = null;
        tags.forEach(tag => {
            todo = todo.replace(tag, "")
            let cmd = tag.substring(0, 2);
            if ( [':d', ':h'].includes(cmd) ){
                expiry = new Date();
                expiry.setHours(0);
                expiry.setMinutes(0)
                try {
                    let val = parseInt(tag.substring(2, tag.length))
                    if (cmd===':d') expiry.setDate( expiry.getDate()+val)
                    if (cmd===':h') expiry.setHours(val)
                }catch (e) {
                    console.log('Command Error', e)
                }
            }else fTags.push(tag.replace(":", ""))
        })
        if (!milestone.todos) milestone.todos = [];
        milestone.todos.push({
            id: TASKS.doc().id,
            created: new Date(),
            name: todo,
            tags: fTags,
            expiry: expiry,
            project: project.id,
            milestone: project.milestones.length,
            users: [user.uid],
            done: null
        })
        milestone.todos = milestone.todos
        todo = "";
    }
    const addMilestone = () => {
        project.milestones = [...project.milestones, Object.assign({}, milestone)];
        setTimeout(()=>{
            milestone.tag = milestone.users = milestone.todos = [];
            milestone.name = milestone.description = milestone.budget = "";
        }, 50)
    }
    const save = () => {

        let fTags = [];
        project.name = new showdown.Converter().makeHtml(" "+project.name.trim()+" ")
        let tags = project.name.split(" ").filter(n => /:/.test(n));
        tags.forEach(tag => {
            project.name = project.name.replace(tag, "")
            let cmd = tag.substring(0, 2);
            if ([":u"].includes(cmd)){
                console.log(tag)
                project.user = [...project.user, ...tag.substring(2, tag.length).split(",")]
            }else fTags.push(tag.replace(":", ""))
        })

        if (note) {
            if (project.name.length>1 && project.description.length>1) {
                let nt = {
                    name: project.name,
                    content: project.description,
                    id: NOTE.doc().id,
                    user: project.user,
                    tag: fTags,
                    created: new Date(),
                }
                NOTE.doc(nt.id).set(nt).then(()=>dispatch('close', {})).catch(e=>console.log(e))
            }
        }else{
            project.tag = fTags
            let batch = firestore.batch();
            let mss = []
            project.milestones.forEach(milestone => {
                let pml = Object.assign(milestone, {});
                if (milestone.todos) {
                    for (let i=0; i<milestone.todos.length; i++){
                        let td = milestone.todos[i]
                        td.user = project.user
                        batch.set(TASKS.doc(td.id), td)
                    }
                    delete pml.todos;
                }
                mss.push(pml)
            })
            project.milestones = mss;
            batch.set(PROJECTS.doc(project.id), project)
            batch.commit().then( () => {
                dispatch('close', {})
            })
        }
    }
</script>

<div class="text-center py-8">

    {#if steps===0}
        <h1 class="flex-1 title text-center mb-8">Add A Project</h1>
        <form class="card" on:submit|preventDefault={()=>note?save():steps=1}>
            <input required aria-label="none" type="text" class="input m-4" placeholder="Give Your Project A Title" bind:value={project.name}>
            <textarea required aria-label="none" type="text" class="input m-4" placeholder="A short description of what this project is about" bind:value={project.description}></textarea>
            <div class="flex justify-between mx-4 space-x-4 {note?'hidden':''}">
                <input type="datetime-local" aria-label="none" class="input flex-1" bind:value={project.starting}>
                <input type="datetime-local" aria-label="none" class="input flex-1" bind:value={project.expiry}>
            </div>
            <button type="submit" class="button m-4">{note?"Save":"Next"}</button>
        </form>
    {/if}

    {#if steps===1}
        <h1 class="card sub-title text-center p-4 uppercase cursor-pointer mb-8" on:click={()=>steps=0}>{@html project.name}</h1>

        {#each project.milestones as m, x}
            <div class="card p-4 my-2">
                <div class="flex justify-between">
                    <h2>{x+1} {m.name}</h2>
                    <div class="flex justify-between space-x-8">
                        <button class="icon w-6 h-6" on:click={()=>{milestone=Object.assign({},m)}}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                            </svg>
                        </button>
                        <Cancel on:clicked={()=>{project.milestones[x].todos?project.milestones[x].todos.forEach( todo => TASKS.doc(todo.id).delete()):''; PROJECTS.doc(project.id).update({milestones: FIELD_VALUE.arrayRemove(m)}); project.milestones.splice(x, 1); project.milestones=project.milestones}}/>
                    </div>
                </div>
                <p class="text-gray mx-4">{m.description}</p>
                {#if m.todos}
                    {#each m.todos as td, x}
                        <div class="text-sm rounded rounded-2xl flex items-center justify-between mx-4 bg-gray px-2 duration-300 my-1 transform hover:text-primary">
                            <p class="text-left">
                                {#if td.expiry && td.expiry!==null}
                                    <span class="font-bold {new Date().getDate()===td.expiry.getDate()?'text-primary':''} mr-4">
                                        {td.expiry.getDate()} - {td.expiry.getHours()}
                                    </span>
                                {/if}
                                {@html td.name}
                                {#each td.tags as tag}
                                    <span class="tag text-sm">{tag}</span>
                                {/each}
                            </p>
                        </div>
                    {/each}
                {/if}
            </div>
        {/each}

        <div class="card mt-8">
            <h3 class="sub-title text-center my-4 uppercase">Add Milestones</h3>
            <div class="flex flex-col">
                <input required aria-label="none" type="text" class="input m-4" placeholder="Milestone Name" bind:value={milestone.name}>
                <textarea aria-label="none" type="text" class="input m-4" placeholder="Additional Details For the Milestone" bind:value={milestone.description}></textarea>
                {#if milestone.todos}
                    {#each milestone.todos as td, x}
                        <div class="rounded rounded-2xl flex items-center justify-between mx-4 bg-gray p-2 duration-300 my-1 transform hover:text-primary">
                            <p class="text-left">
                                {#if td.expiry}
                                <span class="font-bold {new Date().getDate()===td.expiry.getDate()?'text-primary':''} mr-4">
                                    {td.expiry.getDate()} - {td.expiry.getHours()}
                                </span>
                                {/if}
                                <span>{@html td.name}</span>
                                {#each td.tags as tag}
                                    <span class="tag text-sm">{tag}</span>
                                {/each}
                            </p>
                            <div class="flex items-center space-x-4">
                                <Cancel on:clicked={()=>{milestone.todos.splice(x, 1); milestone.todos=milestone.todos;}}/>
                            </div>
                        </div>
                    {/each}
                {/if}
                <input type="text" aria-label="none" class="input m-4" placeholder="Type milestone task" on:keypress={e=>{if (e.charCode===13) addTodo()}} bind:value={todo}>
                <div class="flex mx-4 space-x-2">
                    <input type="number" aria-label="none" class="input flex-1" placeholder="Budget" bind:value={milestone.budget}>
                    <input type="datetime-local" aria-label="none" class="input flex-1" bind:value={milestone.expiry}>
                </div>
                <div class="flex justify-center">
                    <button class="icon m-8" on:click={()=>addMilestone()}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    {/if}

    {#if project.milestones.length>0}
        <button class="button my-16 title" on:click={()=>save()}>Save</button>
    {/if}

</div>

