<script>
    import {createEventDispatcher} from 'svelte'
    import Icon from "./Icon.svelte";
    let dispatch = createEventDispatcher();
    export let close = true;
</script>

<div class="absolute top-0 h-full left-0 right-0 flex items-center justify-center top-0 bottom-0 z-10">
    <div class="absolute h-full w-full blur"></div>
    <div class="absolute h-full w-full bg-accent opacity-10" on:click={()=>dispatch('close')}></div>
    <div class="absolute">
        <div class="card bg-back p-4 overflow-auto">
            <slot></slot>
            {#if close}
                <Icon icon={"cancel"} classes="absolute top-0 right-0 w-12 h-12 rounded-tr shadow p-2 text-white bg-primary" on:clicked={()=>dispatch('close')}/>
            {/if}
        </div>
    </div>
</div>