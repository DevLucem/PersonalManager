<script>
    import {createEventDispatcher} from "svelte"
    let dispatch = createEventDispatcher();
    import moment from "moment"
    import {fade} from 'svelte/transition';
    import Icon from "../../../components/Icon.svelte";
    import {deleteData} from "../../../firebase";
    export let task;
</script>

<div class="flex justify-between items-center hover:text-primary hover:bg-back rounded group" in:fade>
    <div class="flex items-center">
        <Icon icon="edit" classes={'h-4 w-4 invisible group-hover:visible'} on:clicked={()=>dispatch('data', task)}/>
        <div class="py-1">
            <p style="color: {task.color}">
                {@html task.name}
                {#each task.tags as tag}
                    <span class="tag uppercase font-bold]" style="background-color: {tag.split('#').length>1? tag.split('#')[1] : ''}">{tag.split('#')[0]}</span>
                {/each}
            </p>
            {#if task.ending}
                <div class="tag-line -mt-0.5">{moment(task.ending).fromNow()}</div>
            {/if}
        </div>
    </div>
    <div class="flex items-center">
        {#if task.created}
            <span class="tag-line">{moment(task.created.toDate()).fromNow()}</span>
        {/if}
        <Icon icon="check" classes='h-6 w-6 m-1 icon' on:clicked={()=>deleteData(task)}/>
    </div>
</div>