<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import Milestone from "../milestone/Milestone.svelte";
    import Icon from "../../../components/Icon.svelte";
    export let project;
    export let data = [];
</script>

<div class="full-overlay">

    <div class="flex justify-between">
        <h1 class="text-lg font-bold flex items-center" style="color: {project.color}">
            <Icon on:clicked={()=>dispatch('data', {type: 'milestone', project: project.id, color: project.color, starting: project.starting})} icon="add" classes="h-6 w-6 text-white bg-primary p-0.5 rounded-full m-2"/>
            {project.name}
        </h1>
    </div>

    {#each data.filter(doc => {return doc.type==='milestone' && !doc.milestone}) as milestone}
        <Milestone on:data={e=>dispatch('data', {...e.detail, project: project.id})} {milestone} {data}/>
    {/each}

    <div class="h-8 text-center">
        {#if project.description}
            {@html project.description}
        {/if}
    </div>

</div>
