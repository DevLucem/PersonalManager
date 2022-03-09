<script>
    import Tasks from "./components/Tasks.svelte";
    import {PROJECTS, TASKS, NOTE, MILESTONES} from "../../firebase";
    import Project from "./components/Project.svelte";
    import Cancel from "../../assets/Cancel.svelte";
    import AddButton from "../../assets/AddButton.svelte";
    import Projects from "./components/Projects.svelte";
    import AddProject from "./components/AddProject.svelte";

    export let user;


    let projects = [];
    PROJECTS.where("users", "array-contains-any", [user.uid]).onSnapshot(snapshot => {
        projects = [];
        console.log('projects', snapshot.size)
        snapshot.docs.forEach(doc => projects = [doc.data(), ...projects])
    })

    let milestones = [];
    MILESTONES.where("users", "array-contains-any", [user.uid]).onSnapshot(snapshot => {
        milestones = [];
        console.log('milestones', snapshot.size)
        snapshot.docs.forEach(doc => milestones = [doc.data(), ...milestones])
    })

    let tasks = [];
    TASKS.where("users", "array-contains-any", [user.uid]).onSnapshot(snapshot => {
        tasks = [];
        console.log('tasks', snapshot.size)
        snapshot.docs.forEach(doc => tasks = [doc.data(), ...tasks])
    })

    let notes = [];
    let note = false;
    NOTE.where("user", "==", user.uid).onSnapshot(snapshot => {
        notes = [];
        snapshot.docs.forEach(doc => notes = [doc.data(), ...notes])
    })

    let addProject = false;
    let viewProject = null;
    let editProject = null;
</script>

<svelte:head>
    <title>Professional Wealth Manager</title>
</svelte:head>

<div class="lg:flex lg:space-x-4">
    <div class="flex-1 flex">
        <Tasks tasks={tasks.filter(task => !task.project)} {user}/>
    </div>
    <div class="flex-1 flex">
        <Projects {user} {tasks} {projects} on:add={()=>addProject=true} on:view={e=>viewProject=e.detail} on:edit={e=>editProject=e.detail}/>
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
    <div class="overflow-auto z-10 absolute left-0 top-0 bottom-0 right-0 w-full flex flex-col items-center justify-center" style="backdrop-filter: blur(15px);">
        <div class="w-full h-screen bg-gray opacity-60"></div>
        <div class="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center p-8 overflow-auto">
            {#if addProject || editProject}
                <AddProject {user} {editProject} milestones={milestones.filter(milestone => editProject && milestone.project===editProject.id)} tasks={tasks.filter(task => editProject && task.project===editProject.id)} on:exit={()=>editProject=addProject=false}/>
            {/if}
            {#if viewProject}
                <Project {user} project={viewProject} milestones={milestones.filter(milestone => milestone.project===viewProject.id)} tasks={tasks.filter(task => task.project===viewProject.id)} on:exit={()=>viewProject=false}/>
            {/if}
        </div>
        <div class="absolute top-0 left-0 m-8">
            <Cancel on:clicked={()=>editProject=viewProject=addProject=null}/>
        </div>
        <div class="absolute top-0 right-0 m-8">
            <Cancel on:clicked={()=>editProject=viewProject=addProject=null}/>
        </div>
    </div>
{/if}

<!--
{#if addProject || viewProject || editProject}
    <div class="bg-gray overflow-auto overscroll-none h-screen z-10 absolute left-0 top-0 opacity-95 w-full" style="backdrop-filter: blur(20px);">
        <div class="contain pt-8 text-center">
            <Cancel on:clicked={()=>{viewProject=addProject=editProject=null}}/>
            {#if addProject || editProject}
                <Add {note} {user} {editProject} tasks={editProject ? tasks.filter(td => td.project===editProject.id && !td.done).reverse() : null} on:close={()=>note=addProject=editProject=null}/>
            {/if}
            {#if viewProject}
                <Project {user} project={viewProject} tasks={tasks.filter(td => td.project===viewProject.id)} on:close={()=>viewProject=false}/>
            {/if}
        </div>
    </div>
{/if}-->
