<script>
    import Todos from "./components/Todos.svelte";
    import Project from "./components/Project.svelte";
    import Add from "./components/Add.svelte";
    import {PROJECT, TASK, NOTE} from "../../firebase";
    import Cancel from "../../assets/Cancel.svelte";
    import AddButton from "../../assets/AddButton.svelte";

    export let user;

    let todo = [];
    TASK.where("user", "array-contains-any", [user.uid]).onSnapshot(snapshot => {
        todo = [];
        snapshot.docs.forEach(doc => todo = [doc.data(), ...todo])
    })

    let project = [];
    PROJECT.where("user", "==", user.uid).onSnapshot(snapshot => {
        project = [];
        snapshot.docs.forEach(doc => project = [doc.data(), ...project])
    })

    let notes = []; let note = false;
    NOTE.where("user", "==", user.uid).onSnapshot(snapshot => {
        notes = [];
        snapshot.docs.forEach(doc => notes = [doc.data(), ...notes])
    })

    $: current = todo.filter(td => !td.project)
    // $: project.forEach(pj => current = [...current, todo.filter(td => td.project === pj.id)[0]])

    let completed = false;
    let addProject = false;
    let viewProject = null;
    let editProject = null;
</script>

<svelte:head>
    <title>Professional Wealth Manager</title>
</svelte:head>

<div class="lg:flex lg:space-x-4">
    <div class="flex-1 flex">
        <Todos todo={current} {user}/>
    </div>

    <div class="space-y-4 mt-16 lg:mb-0 lg:mt-12 bg-gray p-8 rounded rounded-3xl shadow shadow-2xl flex-1">
        <div class="flex justify-between title">
            <div>{project.filter(p => !p.done).length} Ongoing</div>
            <div class="h-12">
                <div class="icon">
                    <AddButton dark={true} on:clicked={()=>addProject=true}/>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2">
            {#each project.filter(p => !p.done) as project}
                <div class="card p-4 m-2 cursor-pointer">
                    <h3 class="sub-title truncate" on:click={()=>viewProject=project}>{project.name}</h3>
                    <p class="flex-1" on:click={()=>viewProject=project}>{project.overview}</p>
                    {#if todo.filter(t=>t.project===project.id).length>0}
                        <p class="text-sm truncate text-primary flex">{@html todo.filter(t=>t.project===project.id)[0].name}</p>
                    {/if}
                    <button on:click={()=>editProject=project} class="border border-gray rounded-xl p-2 font-bold uppercase mt-4">Edit</button>
                </div>
            {/each}
        </div>
    </div>
</div>

<div class="mt-4 bg-fore rounded rounded-xl">
    <div on:click={()=>completed=!completed} class="text-primary p-6 cursor-pointer flex items-center justify-between text-4xl font-bold">
        <div class="flex justify-between border border-gray rounded-xl p-4 w-full">
            <h3 class="text-2xl">{project.filter(p => p.done).length} Completed</h3>
            <button class="icon w-8 h-8 border border-gray">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>
    </div>
    {#if completed}
        <div class="grid grid-cols-2 lg:grid-cols-3 mx-8">
            {#each project.filter(p => p.done) as project}
                <div class="card p-4 mt-4 mx-2 my-4 border-2 border-gray">
                    <h3 class="sub-title">{project.name}</h3>
                    <p>{project.done.toDate()}</p>
                    <button on:click={()=>{if (confirm("UnMark This Project As Complete?")) PROJECT.doc(project.id).update({done: null})}}
                            class="button mt-4">Grind
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</div>

<div class="mt-4 bg-gray p-8 rounded rounded-3xl shadow shadow-2xl flex-1">
    <div class="flex justify-between title">
        <div>Notes</div>
        <div class="h-12">
            <div class="icon">
                <AddButton dark={true} on:clicked={()=>{note=true; addProject=true;}}/>
            </div>
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2">
        {#each notes as note}
            <div class="card p-4 m-4">
                <div class="flex justify-between">
                    <h3 class="font-bold text-lg cursor-pointer" on:click={()=>note.show=!note.show}>{note.name}</h3>
                    <Cancel on:clicked={()=>NOTE.doc(note.id).delete()}/>
                </div>
                {#if note.show}
                    <div class="border border-gray rounded rounded-2xl p-4 m-2">{note.content}</div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<div>
    <h3>User: {user.uid}</h3>
</div>


{#if addProject || viewProject || editProject}
    <div class="bg-gray overflow-auto overscroll-none h-screen z-10 absolute left-0 top-0 opacity-95 w-full" style="backdrop-filter: blur(20px);">
        <div class="contain pt-8 text-center">
            <Cancel on:clicked={()=>{viewProject=addProject=editProject=null}}/>
            {#if addProject || editProject}
                <Add {note} {user} {editProject} tasks={editProject ? todo.filter(td => td.project===editProject.id && !td.done).reverse() : null} on:close={()=>note=addProject=editProject=null}/>
            {/if}
            {#if viewProject}
                <Project {user} project={viewProject} todo={todo.filter(td => td.project===viewProject.id)} on:close={()=>viewProject=false}/>
            {/if}
        </div>
    </div>
{/if}