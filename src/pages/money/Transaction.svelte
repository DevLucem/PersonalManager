<script>
    import {createEventDispatcher} from "svelte"
    let dispatch = createEventDispatcher();
    import moment from "moment"
    import {scale} from 'svelte/transition';
    import Icon from "../../components/Icon.svelte";
    export let transaction;
</script>

<div class="flex justify-between items-center bg-white p-2 my-2 mx-2 hover:bg-back rounded group" in:scale out:scale style="background-color: {transaction.bgColor}">
    <div class="group relative flex-1">
        <p>
            {transaction.title}
            {#each transaction.tags as tag}
                <span class="tag uppercase font-bold bg-primary" style="background-color: {tag.substring(tag.indexOf('#')+1)}">{tag.split('#')[0]}</span>
            {/each}
        </p>
        <div class="tag-line -mt-0.5">{moment(transaction.start).format("Do MMM")}</div>
    </div>
    <div class="flex items-center">
        <span class="mr-3 uppercase font-bold {transaction.amount<0?'text-secondary':'text-primary'}">{transaction.amount} {transaction.currency}</span>
    </div>
</div>