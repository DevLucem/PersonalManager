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
    PROJECT.where("user", "array-contains-any", [user.uid]).onSnapshot(snapshot => {
        project = [];
        snapshot.docs.forEach(doc => project = [doc.data(), ...project])
    })

    let notes = []; let note = false;
    NOTE.where("user", "==", user.uid).onSnapshot(snapshot => {
        notes = [];
        snapshot.docs.forEach(doc => notes = [doc.data(), ...notes])
    })

    $: current = todo.filter(td => !td.project)

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
    <div class="space-y-4 mt-4 lg:mb-0 bg-gray pt-8 px-8 pb-4 rounded rounded-3xl shadow shadow-2xl flex flex-col flex-1">
        <div class="flex justify-between title">
            <div>{project.filter(p => !p.done).length} Projects</div>
            <div class="h-12">
                <div class="icon">
                    <AddButton dark={true} on:clicked={()=>addProject=true}/>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2">
            {#each project.filter(p => !p.done) as project}
                <div class="card p-4 m-2 cursor-pointer">
                    <h3 class="sub-title truncate" on:click={()=>viewProject=project}>{@html project.name}</h3>
                    <p class="flex-1" on:click={()=>viewProject=project}>{project.overview}</p>
                    {#if todo.filter(t=>t.project===project.id).length>0}
                        <p class="text-sm truncate text-primary flex">{@html todo.filter(t=>t.project===project.id)[0].name}</p>
                    {/if}
                    <button on:click={()=>editProject=project} class="border border-gray rounded-xl p-2 font-bold uppercase mt-4">Edit</button>
                </div>
            {/each}
        </div>
        <div class="flex flex-col justify-end items-center flex-1">
            <p on:click={()=>completed=!completed} class="{completed?'w-full':''} text-center text-lg p-2 rounded-lg font-bold text-primary">{project.filter(p => p.done).length} Completed</p>

            {#if completed}
                <div class="grid grid-cols-2">
                    {#each project.filter(p => p.done) as project}
                        <div class="card p-4 mt-2 mx-2 border-2 border-fore hover:border-primary">
                            <h3 class="sub-title">{project.name}</h3>
                            <div class="flex-1 flex justify-center items-end">
                                <button on:click={()=>{if (confirm("UnMark This Project As Complete?")) PROJECT.doc(project.id).update({done: null})}}
                                        class="button w-full mt-4">Grind
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<div class="mt-4 p-8">
    <div class="flex">
        <div class="icon h-12 w-12">
            <AddButton dark={true} on:clicked={()=>{note=true; addProject=true;}}/>
        </div>
        <h2 class="title ml-4">Notes</h2>
    </div>
    <div class="flex flex-wrap">
        <div class="bg-fore rounded rounded-lg text-white p-4 m-2 flex flex-col justify-center">
            <p class="text-white">Your User ID</p>
            <h3 class="font-bold text-sm cursor-pointer text-primary select-all">{user.uid}</h3>
        </div>
        {#each notes as note}
            <div class="bg-fore rounded rounded-lg text-white p-4 m-2">
                <div class="flex space-x-8">
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