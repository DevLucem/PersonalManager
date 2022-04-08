<script>

    import {createEventDispatcher, onMount} from 'svelte'

    const dispatch = createEventDispatcher();
    onMount(() => window.scrollTo(0, 0));
    import {TASKS, PROJECTS, firestore, MILESTONES} from "../../../firebase";
    import Task from "./Task.svelte";

    export let project;
    export let tasks;
    export let milestones;
    export let user;
    export let users;

    const complete = () => {if (confirm("Mark This Project As Complete?")) PROJECTS.doc(project.id).update({done: new Date(), pause: null}).then(()=>dispatch('exit', {}))}
    let loaded = tasks && tasks.filter(td=>!td.done).length>0;
    $: if (loaded && tasks && tasks.filter(td=>!td.done).length<1) complete();

    const deleteProject = () => {
        let batch = firestore.batch();
        batch.delete(PROJECTS.doc(project.id));
        loaded = false;
        milestones.forEach(milestone => batch.delete(MILESTONES.doc(milestone.id)))
        tasks.forEach(task => batch.delete(TASKS.doc(task.id)))
        batch.commit().then( () => dispatch('exit')).catch(e => console.error(e))
    }

    console.log(milestones, tasks)
    let sharing = false; let shares = [];
    shares = project.users.slice(1);
    function shareProject(){
        let current = project.users.slice(1)
        let changed = current.sort().toString() === shares.sort().toString()
        console.log(shares, current, changed, project.users)

        let batch = firestore.batch();
        batch.update(PROJECTS.doc(project.id), {users: [user.uid, ...shares]})
        milestones.forEach(ms => batch.update(MILESTONES.doc(ms.id), {users: [user.uid, ...shares]}))
        tasks.forEach(ts => batch.update(TASKS.doc(ts.id), {users: [user.uid, ...shares]}))
        batch.commit().then(()=> {
            sharing = false;
            shares = []
        })
        // update the project, milestones, tasks with the same users
    }


</script>


<div class="py-8 flex flex-col justify-center">
    <h1 class="text-center p-4 font-bold text-primary title flex justify-between">
        {@html project.name}
        {#if user.uid===project.users[0]}
            <button on:click={()=>sharing=true}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
            </button>
        {/if}
    </h1>
    <div class="card p-4 text-gray my-4">
        <p>{project.description}</p>
        <p class="text-center"><span class="select-all">{project.id}</span>  ~  Created {project.created.toDate()}</p>
    </div>
    <div class="my-8">
        {#each milestones as milestone, x}
            <div class="card p-6 my-4">
                <div class="flex justify-between">
                    <span class="sub-title">{@html milestone.name}</span>
                    <h2 class="">{milestone.expiry}</h2>
                </div>
                <p>
                    {milestone.description}
                    {#if milestone.tags}
                        {#each milestone.tags as tag}
                            <span class="tag">tag</span>
                        {/each}
                    {/if}
                </p>
                {#each tasks.filter(task => task.milestone===milestone.id) as task, x}
                    <Task {task} {user} checking={true}/>
                {/each}
            </div>
        {/each}
    </div>

    {#if user.uid===project.users[0]}
        <div class="flex">
            <button on:click={()=>{if (confirm("Delete This Project Permanently?")) deleteProject()}}
                    class="bg-red-300 flex-1 mx-4 rounded rounded-2xl text-white font-bold p-4 text-2xl">Delete Project
            </button>
            <button on:click={()=>complete()}
                    class="button bg-green-300 mx-4 flex-1 rounded rounded-full text-white font-bold p-4 text-2xl">Mark Complete
            </button>
        </div>
    {/if}
</div>

{#if sharing}
    <div class="absolute top-0 bottom-0 left-0 right-0 bg-gray z-10 backdrop-blur-2xl h-screen flex items-center justify-center">
        <div class="card p-8">
            <h1 class="sub-title mb-6">Share WIth</h1>
            {#each users as user}
                <label>
                    <input type=checkbox bind:group={shares} name="flavours" value={user.user}>
                    {user.name}
                </label>
            {/each}
            <div class="flex justify-between space-x-8">
                <button class="button mt-8" on:click={()=>{sharing=false}}>Cancel</button>
                <button class="button mt-8" on:click={()=>shareProject()}>Save</button>
            </div>
        </div>
    </div>
{/if}