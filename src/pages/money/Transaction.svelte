<script>
    import {createEventDispatcher} from "svelte"
    let dispatch = createEventDispatcher();
    import moment from "moment"
    import {fade} from 'svelte/transition';
    import Icon from "../../components/Icon.svelte";
    import {deleteData} from "../../firebase";
    export let transaction;
</script>

<div class="flex justify-between items-center hover:bg-back rounded group" in:fade>
    <div class="flex items-center group relative flex-1" style="color: {transaction.color}">
        <Icon icon="edit" classes={'h-4 w-4 invisible group-hover:visible hover:text-primary'} on:clicked={()=>dispatch('data', transaction)}/>
        {transaction.name}
        {#each Object.keys(transaction.amount) as currency}
            <span class="tag uppercase font-bold">{transaction.amount[currency]}{currency}</span>
        {/each}
    </div>
    <div class="flex items-center">
        <div class="tag-line -mt-0.5">{moment(transaction.created).fromNow()}</div>
<!--        <Icon icon="check" classes='h-5 w-5 m-1 icon' on:clicked={()=>deleteData(transaction)}/>-->
    </div>
</div>