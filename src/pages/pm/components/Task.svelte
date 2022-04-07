<script>
    import Cancel from "../../../assets/Cancel.svelte";
    import {TASKS, FIELD_VALUE} from "../../../firebase";
    export let task;
    export let checking;
    export let user;
    const completed = () => {
        let updates = {}
        if (task.users[0]===user.uid)
            TASKS.doc(task.id).update({done: task.done ? null : new Date()})
        else
            TASKS.doc(task.id).update({tags: FIELD_VALUE[task.tags.includes("done")?'arrayRemove':'arrayUnion']("done") })
    }
    let shared = true;
</script>
<div class="rounded rounded-xl flex items-center justify-between mx-2 bg-gray p-2 duration-300 my-1 transform hover:text-primary {task.done?'opacity-50 hover:opacity-100':''}">
    <div class="flex">
        <p class="flex flex-wrap items-center">
            {#if task.expiry}
            <span class="font-bold {new Date().getDate()===task.expiry.toDate().getDate()?'text-primary':''} mr-4">
                {task.expiry.toDate().getDate()} - {task.expiry.toDate().getHours()}
            </span>
            {/if}
            <span>{@html task.name}</span>
            {#each task.tags as tag}
                <span class="text-sm {tag==='done' && task.users[0]===user.uid?'rounded-full font-bold uppercase bg-red-500 px-2 mx-2':'tag'}">{tag}</span>
            {/each}
        </p>
    </div>
    <div class="flex items-center space-x-4">
        {#if checking}
            <button on:click={()=>completed()} class="icon w-6 h-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-full p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </button>
        {/if}
        {#if !task.done && task.users[0]===user.uid}
            <Cancel on:clicked={()=>task.done?TASKS.doc(task.id).update({done: null}):TASKS.doc(task.id).delete()}/>
        {/if}
    </div>
</div>