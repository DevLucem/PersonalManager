<script>
    import Task from "./Task.svelte";
    import AddTodo from "./AddTask.svelte";
    export let tasks;
    export let user;
    let shared = true;
    let completed = false;
</script>

<div class="card mt-4 pb-1 flex-1 flex flex-col">
    <AddTodo {user} save={true}/>
    {#each tasks.filter(task=> (completed ? task.done : !task.done) && (shared || task.users.length<=1) ).sort((a, b) => a.created.toDate()-b.created.toDate()) as task, x}
        <Task {task} {user} checking={true}/>
    {/each}
    <div class="flex flex-1 items-end justify-between mx-2 pb-1 mt-2">
        <button on:click={()=>shared=!shared} class="{!shared?'text-primary':'text-gray'} text-center text-sm px-8 py-1 rounded-lg font-bold border rounded-full border-gray">Private</button>
        <button on:click={()=>completed=!completed} class="{completed?'text-primary':'text-gray'} text-center text-sm px-8 py-1 rounded-lg font-bold border rounded-full border-gray">{tasks.filter(t => t.done).length} Completed</button>
    </div>
</div>