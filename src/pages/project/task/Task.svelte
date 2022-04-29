<script>
    import {createEventDispatcher} from "svelte"
    let dispatch = createEventDispatcher();
    import moment from "moment"
    import {fade} from 'svelte/transition';
    import Icon from "../../../components/Icon.svelte";
    import {deleteData} from "../../../firebase";
    export let task;
</script>

<div class="flex justify-between items-center hover:bg-back rounded group" in:fade>
    <div class="flex items-center group relative flex-1">
        <Icon icon="edit" classes={'h-4 w-4 invisible group-hover:visible'} on:clicked={()=>dispatch('data', task)}/>
        <div class="py-1">
            <p style="color: {task.color}">
                {task.name}
                {#each task.tags as tag}
                    <span class="tag uppercase font-bold]" style="background-color: {tag.split('#').length>1? tag.split('#')[1] : ''}">{tag.split('#')[0]}</span>
                {/each}
            </p>
        </div>
        <div>
            {#if task.description}
                <div class="absolute z-10 left-0 bg-back rounded p-2 hidden group-hover:inline mt-4">
                    {@html task.description}
                </div>
            {/if}
        </div>
    </div>
    <div class="flex items-center">
        {#if task.ending}
            <div class="tag-line -mt-0.5">{moment(task.ending).fromNow()}</div>
        {/if}
        <Icon icon="check" classes='h-5 w-5 m-1 icon' on:clicked={()=>deleteData(task)}/>
    </div>
</div>