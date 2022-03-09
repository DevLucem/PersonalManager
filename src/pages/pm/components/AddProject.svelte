<script>
    import {createEventDispatcher, onMount} from 'svelte'

    const dispatch = createEventDispatcher();
    onMount(() => window.scrollTo(0, 0));

    import Cancel from "../../../assets/Cancel.svelte";
    import {firestore, PROJECTS, TASKS, FIELD_VALUE, NOTE, MILESTONES} from "../../../firebase";
    import showdown from "showdown";
    import AddTask from "./AddTask.svelte";

    // todo Just a little clean up here
    export let user;
    export let editProject;
    export let tasks;
    export let milestones;

    Array.prototype.unique = function() {
        let a = this.concat();
        for(let i=0; i<a.length; ++i) {
            for(let j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    };
    const extractTags = (source) => {
        let res = {text: "", tags: [], users: []}
        res.text = new showdown.Converter().makeHtml(" " + source.trim() + " ")
        let tags = res.text.split(" ").filter(n => /:/.test(n));
        tags.forEach(tag => {
            res.text = project.name.replace(tag, "")
            let cmd = tag.substring(0, 2);
            if ([":u"].includes(cmd)) {
                res.users = [...res.users, ...tag.substring(2, tag.length).split(",")]
            } else res.tags.push(tag.replace(":", ""))
        })
        return res
    }

    let project = editProject ? editProject : {
        name: "",
        created: new Date(),
        id: PROJECTS.doc().id,
        description: "",
        tags: [],
        users: [user.uid],
        milestones: []
    };

    if (editProject) {
        project.name = new showdown.Converter().makeMarkdown(project.name);
        project.milestones = [];
        milestones.forEach( milestone => {
            milestone.tasks = tasks.filter(tsk=>tsk.milestone===milestone.id);
            project.milestones.push(milestone)
        })
    }

    const addProject = () => {

        let tags = extractTags(project.name);
        project.name = tags.text;
        console.log('users', tags.users)
        project.users = project.users.concat(tags.users).unique()
        project.tags = project.tags.concat(tags.tags).unique()

        let batch = firestore.batch();

        project.milestones.forEach(milestone => {
            let pml = Object.assign(milestone, {});
            pml.created = project.created;
            if (pml.starting) pml.starting = new Date(pml.starting)
            if (pml.expiry) pml.expiry = new Date(pml.expiry)
            pml.project = project.id;
            if (!pml.id) pml.id = MILESTONES.doc().id
            let tags1 = extractTags(pml.name);
            pml.name = tags1.text;
            pml.users = [user.uid].concat(tags.users).concat(tags1.users).unique()
            project.users = project.users.concat(tags1.users).unique()
            pml.tags = pml.tags.concat(tags1.tags).unique()
            if (milestone.tasks) {
                milestone.tasks.forEach(task => {
                    let tsk = task;
                    tsk.milestone = pml.id;
                    tsk.project = project.id;
                    tsk.users = tsk.users.concat(tags.users).unique()
                    pml.users = pml.users.concat(tsk.users).unique()
                    project.users = project.users.concat(tsk.users).unique()
                    batch.set(TASKS.doc(tsk.id), tsk)
                })
                delete pml.tasks;
            }
            batch.set(MILESTONES.doc(pml.id), pml)
        })
        delete project.milestones;
        batch.set(PROJECTS.doc(project.id), project)
        console.log('uploading')
        batch.commit().then(() => {
            dispatch('exit', {})
        }).catch(e => console.log(e))
    }

    let milestone = {
        name: "",
        description: "",
        tags: [],
        users: [],
        budget: "",
        tasks: []
    }
    const addMilestone = () => {
        project.milestones = [...project.milestones, Object.assign({}, milestone)];
        setTimeout(() => {
            milestone.tag = milestone.users = milestone.tasks = [];
            milestone.name = milestone.description = milestone.budget = "";
        }, 50)
    }

    const addTask = (task) => {
        if (!milestone.tasks) milestone.tasks = [];
        milestone.tasks = [...milestone.tasks, task];
    }

    let steps = 0;
    const closeEditor = () => dispatch('exit', {})
</script>

<div class="max-w-xl m-auto">

    {#if steps===0}
        <h1 class="flex-1 title text-center mb-8">Add A Project</h1>
        <form class="card" on:submit|preventDefault={()=>steps=1}>
            <input required aria-label="none" type="text" class="input m-4" placeholder="Give Your Project A Title" bind:value={project.name}>
            <textarea required aria-label="none" type="text" class="input m-4" placeholder="A short description of what this project is about" bind:value={project.description}></textarea>
            <div class="flex justify-between mx-4 space-x-4">
                <input type="datetime-local" aria-label="none" class="input flex-1" bind:value={project.starting}>
                <input type="datetime-local" aria-label="none" class="input flex-1" bind:value={project.expiry}>
            </div>
            <button type="submit" class="button m-4">Next</button>
        </form>
    {/if}

    {#if steps===1}
        <h1 class="card sub-title text-center p-4 uppercase cursor-pointer mb-8" on:click={()=>steps=0}>{@html project.name}</h1>

        {#each project.milestones || [] as m, x}
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
                        <Cancel on:clicked={()=>{project.milestones[x].tasks?project.milestones[x].tasks.forEach( todo => TASKS.doc(todo.id).delete()):''; PROJECTS.doc(project.id).update({milestones: FIELD_VALUE.arrayRemove(m)}); project.milestones.splice(x, 1); project.milestones=project.milestones}}/>
                    </div>
                </div>
                <p class="text-gray mx-4">{m.description}</p>
                {#if m.tasks}
                    {#each m.tasks as td, x}
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
            <h3 class="sub-title text-center my-4 uppercase">Add Milestone</h3>
            <div class="flex flex-col">
                <div class="flex">
                    <input required aria-label="none" type="text" class="input mx-2 my-2 flex-1" placeholder="Milestone Name" bind:value={milestone.name}>
                    <input required aria-label="none" type="number" class="input mx-2 my-2" placeholder="Budget" bind:value={milestone.budget}>
                </div>
                <textarea aria-label="none" type="text" class="input mx-2 my-2" placeholder="Additional Details For the Milestone" bind:value={milestone.description}></textarea>
                {#if milestone.tasks}
                    {#each milestone.tasks as td, x}
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
                                <Cancel on:clicked={()=>{milestone.tasks.splice(x, 1); milestone.tasks=milestone.tasks;}}/>
                            </div>
                        </div>
                    {/each}
                {/if}
                <AddTask {user} on:task={e=>addTask(e.detail)}/>
                <div class="flex mx-2 space-x-2">
                    <input type="datetime-local" aria-label="none" class="input flex-1" bind:value={milestone.starting}>
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

    {#if (project.milestones || []).length>0}
        <div class="flex justify-between">
            <button class="button my-16" on:click={()=>closeEditor()}>Cancel</button>
            <button class="button my-16 title" on:click={()=>addProject()}>Save</button>
        </div>
    {/if}

</div>