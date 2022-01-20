<script>
    import Cancel from "../../../assets/Cancel.svelte";
    import {TASK} from "../../../firebase";
    export let td;
    export let checking;
</script>
<div class="rounded rounded-2xl flex items-center justify-between mx-2 bg-gray p-2 duration-300 my-1 transform hover:text-primary">
    <p class="flex flex-wrap items-center">
        {#if td.expiry}
            <span class="font-bold {new Date().getDate()===td.expiry.toDate().getDate()?'text-primary':''} mr-4">
                {td.expiry.toDate().getDate()} - {td.expiry.toDate().getHours()}
            </span>
        {/if}
        <span>{@html td.name}</span>
        {#each td.tags as tag}
            <span class="tag text-sm">{tag}</span>
        {/each}
    </p>
    <div class="flex items-center space-x-4">
        {#if checking}
            <button on:click={()=>TASK.doc(td.id).update({done: new Date()})} class="icon w-6 h-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </button>
        {/if}
        <Cancel on:clicked={()=>td.done?TASK.doc(td.id).update({done: null}):TASK.doc(td.id).delete()}/>
    </div>
</div>