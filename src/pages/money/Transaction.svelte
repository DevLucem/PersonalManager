<script>
    import {createEventDispatcher} from "svelte"
    let dispatch = createEventDispatcher();
    import moment from "moment"
    import {fade} from 'svelte/transition';
    import Icon from "../../components/Icon.svelte";
    export let transaction;
</script>

<div class="flex justify-between items-center bg-white p-2 my-2 hover:bg-back rounded group" in:fade>
    <div class="group relative flex-1" style="color: {transaction.color}">
        {transaction.name}
        <div class="tag-line -mt-0.5">{moment(transaction.created).fromNow()}</div>
    </div>
    <div class="flex items-center">
        <span class="mr-3 uppercase font-bold {transaction.amount<0?'text-secondary':'text-primary'}">{transaction.amount} {transaction.currency}</span>
        <Icon icon="edit" classes={'h-4 w-4 group-hover:visible hover:text-primary'} on:clicked={()=>dispatch('data', transaction)}/>
    </div>
</div>