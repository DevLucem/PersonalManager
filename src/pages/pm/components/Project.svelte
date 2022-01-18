<script>

    import {createEventDispatcher, onMount} from 'svelte'

    const dispatch = createEventDispatcher();
    onMount(() => window.scrollTo(0, 0));
    import {TASK, PROJECT, firestore} from "../../../firebase";
    import Todo from "./Todo.svelte";

    export let project;
    export let todo;
    const deleteProject = () => {
        let batch = firestore.batch();
        batch.delete(PROJECT.doc(project.id));
        TASK.where("project", "==", project.id).get().then(docs => {
            docs.forEach(doc => batch.delete(TASK.doc(doc.data().id)))
            batch.commit().then(() => dispatch('close', {}))
        })
    }

</script>


<div class="py-8 flex flex-col justify-center">
    <h1 class="text-center p-4 font-bold text-primary title">{project.name}</h1>
    <div class="card p-4 text-gray my-4">
        <p>{project.overview}</p>
        <p class="text-center">{project.id}  ~  Created {project.created.toDate()}</p>
    </div>
    <div class="my-8">
        {#each project.milestones as milestone, x}
            <div class="card p-6 my-4">
                <div class="flex justify-between">
                    <h2 class="sub-title">{x + 1}. {milestone.name}</h2>
                    <h2 class="">{milestone.ending}</h2>
                </div>
                <p>
                    {milestone.overview}
                    {#if milestone.tags}
                        {#each milestone.tags as tag}
                            <span class="tag">tag</span>
                        {/each}
                    {/if}
                </p>
                {#each todo.filter(tf => tf.milestone===x) as td, x}
                    <Todo {td} checking={true}/>
                {/each}
            </div>
        {/each}
    </div>
    <div class="flex">
        <button on:click={()=>{if (confirm("Delete This Project Permanently?")) deleteProject()}}
                class="bg-red-300 flex-1 mx-4 rounded rounded-2xl text-white font-bold p-4 text-2xl">Delete Project
        </button>
        <button on:click={()=>{if (confirm("Mark This Project As Complete?")) PROJECT.doc(project.id).update({done: new Date()}).then(()=>dispatch('close', {}))}}
                class="button bg-green-300 mx-4 flex-1 rounded rounded-full text-white font-bold p-4 text-2xl">Mark Complete
        </button>
    </div>
</div>