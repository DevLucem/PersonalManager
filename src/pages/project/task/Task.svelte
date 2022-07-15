<script>
    import {createEventDispatcher} from "svelte"
    let dispatch = createEventDispatcher();
    import moment from "moment"
    import {fade} from 'svelte/transition';
    import Icon from "../../../components/Icon.svelte";
    import {deleteData} from "../../../firebase";
    export let task;
    export let user;
    export let late;
</script>

<div class="flex justify-between items-center hover:bg-back rounded group" in:fade>
    <p class="flex items-center" style="color: {task.color}">
        {task.name}
        {#if !late && task.ending && task.ending < new Date()}
            <span class="tag uppercase font-bold bg-secondary">late</span>
        {/if}
        {#each task.tags as tag}
            <span class="tag uppercase font-bold bg-primary" style="background-color: {tag.substring(tag.indexOf('#')+1)}">{tag.split('#')[0]}</span>
        {/each}
    </p>
    <div class="flex items-center">
        {#if task.ending}
            <div class="tag-line -mt-0.5">{moment(task.ending).fromNow()}</div>
        {/if}
        <Icon icon="edit" classes={'h-4 w-4 invisible group-hover:visible hover:text-primary'} on:clicked={()=>dispatch('data', task)}/>
        {#if task.users[user?.uid]<3}
            <Icon icon="check" classes='h-5 w-5 m-1 icon' on:clicked={()=>deleteData(task)}/>
        {/if}
    </div>
</div>