<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import Task from "./Task.svelte";
    export let tasks = [];
    export let show = 10;
    let showing = show;
</script>

<div class="card mt-1 p-1 md:p-2 {tasks.length<1?'hidden':'bg-white'}">

    {#each tasks.sort((a, b) => b.ending - a.ending).slice(0, showing) as task}
        <Task {task} on:data={e=>dispatch('data', e.detail)}/>
    {/each}
    {#if tasks.length>showing || showing !== show}
        <div class="flex justify-center mx-4 md:mx-8">
            <button on:click={()=>showing=showing===show?tasks.length:show} class="text-center tag-line text-secondary">{show===showing? `...${tasks.length-show} more`: 'minimize'}</button>
        </div>
    {/if}
</div>