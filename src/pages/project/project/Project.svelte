<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import Milestone from "../Milestone.svelte";
    import Icon from "../../../components/Icon.svelte";
    import QuickTask from "../task/QuickTask.svelte";
    import Tasks from "../task/Tasks.svelte";
    export let project;
    export let user;
    export let data = [];

</script>

<div class="full-overlay">

    <h1 class="text-lg font-bold flex items-center" style="color: {project.color}">
        {#if project.created}
            <Icon on:clicked={()=>dispatch('data', {type: 'milestone', project: project.id, color: project.color, starting: project.starting})} icon="add" classes="h-6 w-6 text-white bg-primary p-0.5 rounded-full m-2"/>
        {/if}
        {project.name}
    </h1>

    <QuickTask on:data={e=>dispatch('data', {...e.detail, project: project.id})} />
    <Tasks {user} on:data={e=>dispatch('data', e.detail)} tasks={data.filter(doc => {return doc.type === 'task' && !doc.milestone})}/>

    {#each data.filter(doc => {return doc.type==='milestone' && !doc.milestone}) as milestone}
        <Milestone {user} on:data={e=>dispatch('data', {...e.detail, project: project.id})} {milestone} {data}/>
    {/each}

    <div class="h-8 text-center">
    </div>

</div>
