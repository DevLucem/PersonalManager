<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import Task from "./Task.svelte";
    export let tasks = [];
    export let show = 10;
</script>

<div class="card p-1 md:p-2 {tasks.length<1?'invisible':'bg-white'}">
    {#each tasks.slice(0, show) as task}
        <Task {task} on:data={e=>dispatch('data', e.detail)}/>
    {/each}
    {#if tasks.length>show}
        <p class="text-center tag-line text-secondary">...and {tasks.length-show} more</p>
    {/if}
</div>