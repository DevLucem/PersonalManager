<script>
    import {createEventDispatcher} from 'svelte';
    import {saveData} from "../../firebase";
    let dispatch = createEventDispatcher();

    export let doc = {type: 'paypal', amount: {}};
    let amount = 50; let currency = 'USD'

    function save() {
        if (doc.name && doc.name.length > 3 && amount !== 0) {
            if (currency.trim().length<2) currency = 'USD'
            else currency = currency.trim().toUpperCase();
            doc.amount[currency] = amount;
            saveData(doc).catch(e => console.error('ERROR:', e))
                .then(() => console.log('saved doc'))

            doc = {type: 'paypal', amount: {}}
            amount = 0
        }
    }
</script>

<form on:submit|preventDefault={save}>
    <div class="flex">
        <input required bind:value={doc.name} class="input w-full flex-1" aria-label="Transact" type="text" placeholder="Transaction Name">
        <input required bind:value={amount} class="w-24 input" type="number" aria-label="Amount" placeholder="Amount">
    </div>
    <div class="flex justify-between mt-2">
        <input required bind:value={doc.type} class="w-24 input" type="text" aria-label="Amount" placeholder="Platform">
        <input required bind:value={currency} class="w-24 input" type="text" aria-label="Amount" placeholder="Currency">
        <button class="button">Save</button>
    </div>
</form>