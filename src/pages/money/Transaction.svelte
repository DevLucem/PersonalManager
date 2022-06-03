<script>
    import {createEventDispatcher} from "svelte"
    let dispatch = createEventDispatcher();
    import moment from "moment"
    import {fade} from 'svelte/transition';
    import Icon from "../../components/Icon.svelte";
    export let transaction;
</script>

<div class="flex justify-between items-center bg-white p-2 my-2 hover:bg-back rounded group" in:fade style="background-color: {transaction.color}">
    <div class="group relative flex-1">
        <p>
            {transaction.name}
            {#each transaction.tags as tag}
                <span class="tag uppercase font-bold bg-primary" style="background-color: {tag.substring(tag.indexOf('#')+1)}">{tag.split('#')[0]}</span>
            {/each}
        </p>
        <div class="tag-line -mt-0.5">{moment(transaction.created).fromNow()}</div>
    </div>
    <div class="flex items-center">
        <span class="mr-3 uppercase font-bold {transaction.amount<0?'text-secondary':'text-primary'}">{transaction.amount} {transaction.currency}</span>
        <Icon icon="edit" classes={'h-4 w-4 group-hover:visible hover:text-primary'} on:clicked={()=>dispatch('data', transaction)}/>
    </div>
</div>