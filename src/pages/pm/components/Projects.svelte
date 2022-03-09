<script>
    import {PROJECTS} from "../../../firebase";
    import AddButton from "../../../assets/AddButton.svelte";
    import {createEventDispatcher} from "svelte";
    let dispatch = createEventDispatcher();

    export let tasks;
    export let user;
    export let projects;

    let completed = false;
    let paused = false;
</script>

<div class="card mt-4 pb-2 pt-4 px-4 flex-1">
    <div class="flex justify-between title">
        <div>{projects.filter(p => !p.done).length} Projects</div>
        <div class="h-12">
            <div class="icon">
                <AddButton dark={true} on:clicked={()=>dispatch('add', {})}/>
            </div>
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2">
        {#each projects.filter(p => !p.done && !p.paused) as project}
            <div class="bg-gray rounded-xl p-4 m-2 cursor-pointer flex flex-col">
                <h3 class="sub-title truncate" on:click={()=>dispatch('view', project)}>{@html project.name}</h3>
                <p class="flex-1 text-sm" on:click={()=>dispatch('view', project)}>{project.description}</p>
                {#if tasks.filter(t=>t.project===project.id).length>0}
                    <p class="text-sm truncate text-primary flex">{@html tasks.filter(t=>t.project===project.id)[0].name}</p>
                {/if}
                {#if user.uid===project.users[0]}
                    <div class="flex justify-between">
                        <button class="font-bold uppercase mt-4" on:click={()=>PROJECTS.doc(project.id).update({paused: new Date()})}>Pause</button>
                        <button class="font-bold uppercase mt-4" on:click={()=>dispatch('edit', project)}>Edit</button>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    <div class="flex flex-col justify-end items-center flex-1">
        <div class="flex justify-between w-full">
            <button on:click={()=>paused=!paused} class="{paused?'text-primary':'text-gray'} text-center text-sm px-8 py-1 rounded-lg font-bold border rounded-full border-gray">{projects.filter(p => p.paused).length} Paused</button>
            <button on:click={()=>completed=!completed} class="{completed?'text-primary':'text-gray'} text-center text-sm px-8 py-1 rounded-lg font-bold border rounded-full border-gray">{projects.filter(p => p.done).length} Completed</button>
        </div>
        {#if completed}
            <div class="grid grid-cols-1 md:grid-cols-2 w-full">
                {#each projects.filter(p => p.done) as project}
                    <div class="border border-gray rounded-xl p-4 m-2 cursor-pointer">
                        <h3 class="text-lg truncate" on:click={()=>dispatch('view', project)}>{@html project.name}</h3>
                        <button on:click={()=>{if (confirm("UnMark This Project As Complete?")) PROJECTS.doc(project.id).update({done: null})}} class="text-sm font-bold uppercase mt-4">Revive</button>
                    </div>
                {/each}
            </div>
        {/if}
        {#if paused}
            <div class="grid grid-cols-1 md:grid-cols-2 w-full">
                {#each projects.filter(p => p.paused) as project}
                    <div class="border border-gray rounded-xl p-4 m-2 cursor-pointer">
                        <h3 class="text-lg truncate" on:click={()=>dispatch('view', project)}>{@html project.name}</h3>
                        <button on:click={()=>{PROJECTS.doc(project.id).update({paused: null})}} class="text-sm font-bold uppercase mt-4">Resume</button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>