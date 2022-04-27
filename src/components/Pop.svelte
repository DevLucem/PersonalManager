<script>
    import {createEventDispatcher, onMount} from 'svelte'
    import {fade, scale} from 'svelte/transition';
    let dispatch = createEventDispatcher();

    import Icon from "./Icon.svelte";
    export let close = true;

    let content;
    onMount(() => {
        content.querySelector('input')?.focus()
    })
</script>

<svelte:window on:keydown={e => {if (e.keyCode === 27) dispatch('close')}}/>

<div class="absolute top-0 h-full left-0 right-0 flex items-center justify-center top-0 bottom-0 z-10">
    <div class="absolute h-full w-full blur" in:fade out:fade></div>
    <div class="absolute h-full w-full bg-accent opacity-10" on:click={()=>dispatch('close')}></div>
    <div class="absolute">
        <div bind:this={content} class="card bg-back p-4 overflow-auto" in:scale out:scale>
            <slot></slot>
            {#if close}
                <Icon icon={"cancel"} classes="absolute top-0 right-0 w-12 h-12 rounded-tr shadow p-2 text-white bg-primary" on:clicked={()=>dispatch('close')}/>
            {/if}
        </div>
    </div>
</div>