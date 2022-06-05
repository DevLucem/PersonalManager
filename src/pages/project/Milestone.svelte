<script>
    import {createEventDispatcher} from 'svelte';

    let dispatch = createEventDispatcher();
    import Tasks from "./task/Tasks.svelte";
    import Icon from "../../components/Icon.svelte";
    import QuickTask from "./task/QuickTask.svelte";
    import Milestone from "./Milestone.svelte";

    import {deleteData} from "../../firebase";

    export let user;
    export let milestone;
    export let data = [];
    export let contract = false;

    $: tasks = data.filter(doc => {return doc.type === 'task' && doc.milestone === milestone.id})
</script>

<div class="card my-2 bg-primary transform duration-300 min-w-fit flex-1 {contract ? '' : 'pb-1'} {milestone.milestone ? 'm-1' : ''}" style="background-color: {milestone.color}">
    <div class="m-2">
        <div class="group relative flex justify-between">
            <h2 class="text-lg font-bold flex items-center">
                {#if milestone.created}
                    <Icon on:clicked={()=>dispatch('data', {type: 'milestone', milestone: milestone.id, starting: milestone.starting})} icon="add" classes="h-6 w-6 my-1 ml-1 mr-3 text-primary bg-white p-0.5 rounded-full"/>
                {/if}
                <span on:click={()=>contract=!contract} class="cursor-pointer">{milestone.name}</span>
                {#if milestone.ending && milestone.ending < new Date()}
                    <span class="tag uppercase font-bold bg-secondary">late</span>
                {/if}
                {#each milestone.tags as tag}
                    <span class="tag uppercase font-bold bg-primary" style="background-color: {tag.substring(tag.indexOf('#')+1)}">{tag.split('#')[0]}</span>
                {/each}
            </h2>
            <div class="flex items-center">
                <Icon icon="pin" classes="h-5 w-5" on:clicked={()=>dispatch('data', {pin: milestone.id})}/>
                {#if milestone.created}
                    <Icon icon="edit" classes="h-5 w-5 group-hover:visible invisible" on:clicked={()=>dispatch('data', milestone)}/>
                {/if}
                {#if data.filter(doc => {return doc.milestone === milestone.id}).length<1 && milestone.users[user?.uid]<3}
                    <Icon icon="check" classes='h-5 w-5 m-1 icon' on:clicked={()=>deleteData(milestone)}/>
                {/if}
            </div>
        </div>
        {#if !contract}
            <QuickTask on:data={e=>dispatch('data', {...e.detail, milestone: milestone.id, starting: milestone.starting})} />
            <Tasks {user} on:data={e=>dispatch('data', e.detail)} {tasks}/>
        {/if}
    </div>
    {#if !contract}
        <div class="flex flex-wrap p-2">
            {#each data.filter(doc => {return doc.type === 'milestone' && doc.milestone === milestone.id}) as milestone}
                <Milestone {user} on:data={e=>dispatch('data', {...e.detail})} {milestone} {data}/>
            {/each}
        </div>
    {/if}
</div>