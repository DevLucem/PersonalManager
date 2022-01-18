<script>
    import { createEventDispatcher } from 'svelte'
    const dispatch = createEventDispatcher();
    export let dark = false;
    function clicked(){ dispatch('clicked',  {'click': true})  }
</script>

<button type="button" class="text-primary {dark?'hover:text-fore':'hover:text-white'}" on:click={()=>clicked()}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
    </svg>
</button>