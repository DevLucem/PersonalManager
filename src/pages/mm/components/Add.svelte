<script>
    import { createEventDispatcher, onMount } from 'svelte'
    import {MONEY} from "../../../firebase";
    const dispatch = createEventDispatcher();
    onMount(() => window.scrollTo(0, 0));
    export let user; export let editBalance;
    let balances = {name: "", amount: {}}; let amounts = "";
    if (editBalance) {
        balances.name = editBalance.name;
        Object.keys(editBalance.amount)
            .forEach( key => amounts += `${editBalance.amount[key]}:${key} `)
    }
    function save(){
        amounts = amounts.trim();
        if (amounts.length<2) return;
        balances.type = balances.name.trim().toLowerCase();
        balances.user = user.uid;
        amounts.split(" ").forEach( bal => {
            let balcode = bal.split(":");
            if (bal.includes(":") && balcode.length>1)
                balances.amount[balcode[1].trim()] = parseFloat(balcode[0])
            else balances.amount.usd = parseFloat(bal.replace(":", ""));
        })
        MONEY.doc(balances.type).set(balances).finally(()=>dispatch("close", {}))
    }
</script>

<svelte:head>
    <title>Add New Balance</title>
</svelte:head>

<div class="text-center py-8 max-w-lg mx-auto">
    <h1 class="flex-1 title text-center mb-8">Add Balance</h1>
    <form class="card" on:submit|preventDefault={()=>save()}>
        <input required aria-label="none" type="text" class="input m-4" placeholder="Balance From?" bind:value={balances.name}>
        <input required aria-label="none" type="text" class="input m-4" placeholder="Amount:currency" bind:value={amounts}>
        <button type="submit" class="button m-8 title">Save</button>
    </form>
</div>

