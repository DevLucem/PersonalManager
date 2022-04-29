<script>
    import {createEventDispatcher} from 'svelte';

    let dispatch = createEventDispatcher();
    import Tasks from "../task/Tasks.svelte";
    import Icon from "../../../components/Icon.svelte";
    import QuickTask from "../task/QuickTask.svelte";
    import Milestone from "./Milestone.svelte";

    export let milestone;
    export let data = [];
</script>

<div class="card mt-4 mb-2 pb-1 {milestone.milestone ? 'ml-2' : ''}" style="background-color: {milestone.color}">
    <div class="m-2">
        <div class="group relative">
            <h2 class="text-lg font-bold flex items-center">
                <Icon on:clicked={()=>dispatch('data', {type: 'milestone', milestone: milestone.id, starting: milestone.starting})} icon="add" classes="h-6 w-6 my-1 ml-1 mr-3 text-primary bg-white p-0.5 rounded-full"/>
                {milestone.name}
                <Icon icon="edit" classes="h-6 w-6 group-hover:visible invisible" on:clicked={()=>dispatch('data', milestone)}/>
            </h2>
            {#if milestone.description}
                <div class="absolute top-0 left-0 mt-8 bg-back rounded p-2 hidden group-hover:inline">
                    {@html milestone.description}
                </div>
            {/if}
        </div>
        <QuickTask on:data={e=>dispatch('data', {...e.detail, milestone: milestone.id, starting: milestone.starting})} />
        <Tasks on:data={e=>dispatch('data', e.detail)} tasks={data.filter(doc => {return doc.type === 'task' && doc.milestone === milestone.id})}/>
    </div>
    {#each data.filter(doc => {return doc.type === 'milestone' && doc.milestone === milestone.id}) as milestone}
        <Milestone on:data={e=>dispatch('data', {...e.detail})} {milestone} {data}/>
    {/each}
</div>