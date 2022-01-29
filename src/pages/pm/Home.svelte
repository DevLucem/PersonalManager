<script>
    import Todos from "./components/Todos.svelte";
    import Project from "./components/Project.svelte";
    import Add from "./components/Add.svelte";
    import {PROJECT, TASK} from "../../firebase";
    import Cancel from "../../assets/Cancel.svelte";
    import AddButton from "../../assets/AddButton.svelte";

    export let user;

    let todo = [];
    TASK.where("user", "==", user.uid).where("done", "==", null).onSnapshot(snapshot => {
        todo = [];
        snapshot.docs.forEach(doc => todo = [doc.data(), ...todo])
    })

    let project = [];
    PROJECT.where("user", "==", user.uid).onSnapshot(snapshot => {
        project = [];
        snapshot.docs.forEach(doc => project = [doc.data(), ...project])
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

<div class="lg:flex lg:space-x-8">
    <div class="flex-1">
        <Todos todo={current} {user}/>
    </div>

    <div class="space-y-4 my-16 lg:mb-0 lg:mt-12 bg-gray p-8 rounded rounded-xl shadow shadow-2xl flex-1">
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
                    <h3 class="sub-title" on:click={()=>viewProject=project}>{project.name}</h3>
                    <p class="flex-1" on:click={()=>viewProject=project}>{project.overview}</p>
                    <button on:click={()=>editProject=project} class="border border-gray rounded-xl p-2 font-bold uppercase mt-4">Edit</button>
                </div>
            {/each}
        </div>
    </div>
</div>

<div class="space-y-4 mt-4">
    <div on:click={()=>completed=!completed} class="text-primary p-6 cursor-pointer flex items-center justify-between text-4xl font-bold bg-fore rounded rounded-xl">
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
        <div class="grid grid-cols-2 md:grid-cols-3">
            {#each project.filter(p => p.done) as project}
                <div class="card p-4 m-2">
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

{#if addProject || viewProject || editProject}
    <div class="bg-gray overflow-auto overscroll-none h-screen z-10 absolute left-0 top-0 opacity-95 w-full" style="backdrop-filter: blur(20px);">
        <div class="contain pt-8 text-center">
            <Cancel on:clicked={()=>{viewProject=addProject=editProject=null}}/>
            {#if addProject || editProject}
                <Add {user} {editProject} on:close={()=>addProject=editProject=null}/>
            {/if}
            {#if viewProject}
                <Project project={viewProject} todo={todo.filter(td => td.project===viewProject.id)} on:close={()=>viewProject=false}/>
            {/if}
        </div>
    </div>
{/if}