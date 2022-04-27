<script>
    import {createEventDispatcher} from 'svelte';
    import { slide } from 'svelte/transition';

    let dispatch = createEventDispatcher();
    import Tasks from "../task/Tasks.svelte";
    import Icon from "../../../components/Icon.svelte";
    import QuickTask from "../task/QuickTask.svelte";

    export let milestone;
    export let tasks = [];
</script>

<div class="card my-4 md:mx-4 md:my-8 p-2" style="background-color: {milestone.color}" in:slide out:slide>
    <h2 class="text-lg font-bold group flex">
        {milestone.name}
        <Icon icon="edit" classes="h-6 w-6 group-hover:visible invisible" on:clicked={()=>dispatch('data', milestone)}/>
    </h2>
    <QuickTask on:data={e=>dispatch('data', {...e.detail, milestone: milestone.id, starting: milestone.starting})} />
    <Tasks on:data={e=>dispatch('data', e.detail)} {tasks}/>
</div>