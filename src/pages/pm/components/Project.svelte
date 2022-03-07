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

    const complete = () => {if (confirm("Mark This Project As Complete?")) PROJECTS.doc(project.id).update({done: new Date()}).then(()=>dispatch('exit', {}))}
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


</script>


<div class="py-8 flex flex-col justify-center">
    <h1 class="text-center p-4 font-bold text-primary title">{@html project.name}</h1>
    <div class="card p-4 text-gray my-4">
        <p>{project.description}</p>
        <p class="text-center">{project.id}  ~  Created {project.created.toDate()}</p>
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