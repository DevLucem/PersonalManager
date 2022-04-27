<script>
    import {createEventDispatcher} from 'svelte';
    import { slide } from 'svelte/transition';

    let dispatch = createEventDispatcher();
    import Tasks from "../task/Tasks.svelte";
    import Icon from "../../../components/Icon.svelte";
    import QuickTask from "../task/QuickTask.svelte";
    import Milestone from "./Milestone.svelte";

    export let milestone;
    export let data = [];
</script>

<div class="card my-2 md:mx-4 md:my-4 p-2" style="background-color: {milestone.color}" in:slide out:slide>
    <h2 class="text-lg font-bold group flex items-center">
        <Icon on:clicked={()=>dispatch('data', {type: 'milestone', milestone: milestone.id, starting: milestone.starting})} icon="add" classes="h-6 w-6 text-primary bg-white p-0.5 rounded-full m-1"/>
        {milestone.name}
        <Icon icon="edit" classes="h-6 w-6 group-hover:visible invisible" on:clicked={()=>dispatch('data', milestone)}/>
    </h2>
    <QuickTask on:data={e=>dispatch('data', {...e.detail, milestone: milestone.id, starting: milestone.starting})} />
    <Tasks on:data={e=>dispatch('data', e.detail)} tasks={data.filter(doc => {return doc.type === 'task' && doc.milestone === milestone.id})}/>
    {#each data.filter(doc => {return doc.type === 'milestone' && doc.milestone === milestone.id}) as milestone}
        <Milestone on:data={e=>dispatch('data', {...e.detail})} {milestone} {data}/>
    {/each}
</div>