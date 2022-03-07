<script>
    import Task from "./Task.svelte";
    import AddTodo from "./AddTask.svelte";
    export let tasks;
    export let user;
</script>

<div class="card mt-4 pb-1 flex-1">
    <AddTodo {user} save={true}/>
    {#each tasks.filter(task=>!task.done).sort((a, b) => a.created.toDate()-b.created.toDate()) as task, x}
        <Task {task} {user} checking={true}/>
    {/each}
</div>