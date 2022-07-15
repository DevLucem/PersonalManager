<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    export let user;
    export let late;

    import Task from "./Task.svelte";
    export let tasks = [];
    export let show = 10;
    let showing = show;
    $: if (showing !== show && tasks.length !== showing)
        showing = tasks.length;
</script>

<div class="card mt-1 p-1 md:p-2 {tasks.length<1?'hidden':late?'bg-danger': 'bg-white'}">
    {#each tasks.slice(0, showing) as task}
        <Task {late} {task} {user} on:data={e=>dispatch('data', e.detail)}/>
    {/each}
    {#if tasks.length>showing || showing !== show}
        <div class="flex justify-center mx-4 md:mx-8">
            <button on:click={()=>showing=showing===show?tasks.length:show} class="text-center tag-line text-secondary">{show===showing? `...${tasks.length-show} more`: '>> minimize <<'}</button>
        </div>
    {/if}
</div>