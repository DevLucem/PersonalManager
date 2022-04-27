<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import Milestone from "../milestone/Milestone.svelte";
    export let project;
    export let data = [];
</script>

<div class="full-overlay">

    <div class="flex justify-between">
        <h1 class="text-lg font-bold text-primary" style="color: {project.color}">{project.name}</h1>
    </div>

    {#each data.filter(doc => {return doc.type==='milestone'}) as milestone}
        <Milestone on:data={e=>dispatch('data', {...e.detail, project: project.id})} {milestone} tasks={data.filter(doc => {return doc.milestone===milestone.id})}/>
    {/each}

    <div class="text-center m-8">
        <button class="button" on:click={()=>dispatch('data', {type: 'milestone', project: project.id, color: project.color, starting: project.starting})}>Add Milestone</button>
    </div>

</div>
