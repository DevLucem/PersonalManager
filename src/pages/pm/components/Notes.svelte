<script>
    import AddButton from "../../../assets/AddButton.svelte";
    import Cancel from "../../../assets/Cancel.svelte";
    import {NOTE} from "../../../firebase";

    export let user;
    export let notes;
    let showNotes;
</script>

<div class="flex bg-fore rounded-2xl text-white items-center justify-between px-4">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 cursor-pointer" viewBox="0 0 20 20" fill="currentColor" on:click={()=>showNotes=!showNotes}>
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
    <h2 class="title flex-1 text-center cursor-pointer py-2" on:click={()=>showNotes=!showNotes}>Notes</h2>
</div>
{#if showNotes}
    <div class="flex flex-wrap">
        <div class="bg-fore rounded rounded-lg text-white p-4 m-2 flex flex-col justify-center">
            <p class="text-white">Your User ID</p>
            <h3 class="font-bold text-sm cursor-pointer text-primary select-all">{user.uid}</h3>
        </div>
        {#each notes as note}
            <div class="bg-fore rounded rounded-lg text-white p-4 m-2">
                <div class="flex space-x-8">
                    <h3 class="font-bold text-lg cursor-pointer" on:click={()=>note.show=!note.show}>{note.name}</h3>
                    <Cancel on:clicked={()=>NOTE.doc(note.id).delete()}/>
                </div>
                {#if note.show}
                    <div class="border border-gray rounded rounded-2xl p-4 m-2">{note.content}</div>
                {/if}
            </div>
        {/each}
    </div>
{/if}