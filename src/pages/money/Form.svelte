<script>
    import {createEventDispatcher} from 'svelte';
    import {deleteData, saveData} from "../../firebase";
    let dispatch = createEventDispatcher();

    const _default = {type: 'transaction', source: 'MPesa', amount: 2000, currency: 'KES'};
    export let doc = _default;

    function save() {
        if (doc.name && doc.name.length > 3 && doc.amount !== 0) {
            if (doc.currency.trim().length<2) doc.currency = 'USD'
            else doc.currency = doc.currency.trim().toUpperCase();
            saveData(doc).catch(e => console.error('ERROR:', e))
                .then(() => console.log('saved doc'))
            doc =  Object.assign({}, _default)
            console.log(doc)
        }
    }

    function remove() {
        deleteData(doc).then(() => console.log('deleted doc'))
        doc =  Object.assign({}, _default);
    }
</script>

<form on:submit|preventDefault={save}>
    <div class="flex">
        <input required bind:value={doc.name} class="input w-full flex-1" aria-label="Transact" type="text" placeholder="Transaction Name">
        <input required bind:value={doc.amount} class="w-24 input" type="number" step="any" aria-label="Amount" placeholder="Amount">
    </div>
    <div class="flex items-center justify-between mt-2">
        <input required bind:value={doc.source} class="w-24 input" type="text" aria-label="Amount" placeholder="Platform">
        <input required bind:value={doc.currency} class="w-24 input" type="text" aria-label="Amount" placeholder="Currency">
        <div>
            {#if doc.id}
                <button type="button" class="button-s" on:click={remove}>Delete</button>
                <button type="button" class="button-o" on:click={()=>doc = Object.assign({}, _default)}>Cancel</button>
            {/if}
            <button type="submit" class="button h-full">Save</button>
        </div>
    </div>
</form>