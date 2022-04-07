<script>
    import Tasks from "./components/Tasks.svelte";
    import {PROJECTS, TASKS, NOTE, MILESTONES, USERS} from "../../firebase";
    import Project from "./components/Project.svelte";
    import Cancel from "../../assets/Cancel.svelte";
    import Projects from "./components/Projects.svelte";
    import AddProject from "./components/AddProject.svelte";
    import Notes from "./components/Notes.svelte";
    import Users from "./components/Users.svelte";

    export let user;

    let projects = [];
    let milestones = [];
    let tasks = [];
    let users = [];

    const getData = (source, callback) => {
        source.where("users", "array-contains-any", [user.uid]).onSnapshot(snapshot => {
            let target = [];
            console.log('projects', snapshot.size)
            snapshot.docs.forEach(doc => target = [doc.data(), ...target])
            callback(target);
        })
    }

    getData(PROJECTS, res => projects = res)
    getData(MILESTONES, res => milestones = res)
    getData(TASKS, res => tasks = res)
    getData(USERS, res => users = res)
    $: console.log(users)

    let notes = [];
    NOTE.where("user", "==", user.uid).onSnapshot(snapshot => {
        notes = [];
        snapshot.docs.forEach(doc => notes = [doc.data(), ...notes])
    })

    let addProject = false;
    let viewProject = null;
    let editProject = null;
</script>

<svelte:head>
    <title>PWM - Project</title>
</svelte:head>

<div class="lg:flex lg:space-x-4">
    <div class="flex-1 flex">
        <Tasks tasks={tasks.filter(task => !task.project)} {user}/>
    </div>
    <div class="flex-1 flex">
        <Projects {user} {tasks} {projects} on:add={()=>addProject=true} on:view={e=>viewProject=e.detail} on:edit={e=>editProject=e.detail}/>
    </div>
</div>

<div class="lg:flex lg:space-x-4 mt-4">
    <div class="flex-1">
        <Notes {user} {notes}/>
    </div>
    <div class="flex-1">
        <Users {user} {users}/>
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

