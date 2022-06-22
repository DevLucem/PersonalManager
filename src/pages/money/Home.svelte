<script>
    import {listenData} from "../../firebase";
    import Form from "./Form.svelte";
    import {scale} from 'svelte/transition';
    import Transaction from "./Transaction.svelte";
    import Icon from "../../components/Icon.svelte";

    export let user;
    export let users;

    let data = [];
    let balances = {'total': {}};
    listenData('MM', res => {
        data = [];
        balances = {'total': {}};
        res.forEach(snapshot => {
            let doc = snapshot.data();
            ['created', 'done'].forEach(val => {
                if (doc[val]) doc[val] = doc[val].toDate();
            })
            if (!balances[doc.source]) balances[doc.source] = {}
            if (!balances[doc.source][doc.currency]) balances[doc.source][doc.currency] = 0
            if (!balances.total[doc.currency]) balances.total[doc.currency] = 0
            balances[doc.source][doc.currency] = balances[doc.source][doc.currency] + doc.amount
            balances[doc.source].color = doc.color;
            balances.total[doc.currency] = balances.total[doc.currency] + doc.amount
            data.push(doc)
        })
        data.sort((a, b) => b.created - a.created)
    })

    function refresh() {
        setTimeout(() => {
            data = data;
            refresh();
        }, 60000)
    }

    refresh()

    let doc;
</script>

<div class="w-full p-4 pb-12">

    <div class="flex overflow-auto flex-none pb-3">
        {#each Object.keys(balances.total) as currency}
            <p class="uppercase font-bold bg-fade p-2 mr-2 border rounded rounded-lg text-primary md:text-lg">{ Math.floor(balances.total[currency]*1e4)/1e4 } {currency}</p>
        {/each}
    </div>

    <div class="md:flex">
        <div class="flex-1">
            <div class="mb-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {#each Object.keys(balances).filter(el => {return el !== 'total'}) as balance}
                    <div class="card bg-primary text-2xl p-2 cursor-pointer m-2 flex-wrap" style="background-color: {balances[balance].color}" in:scale>
                        <p class="pb-2">{balance}</p>
                        <p class="flex flex-wrap items-center">
                            {#each Object.keys(balances[balance]).filter(el => {return !['color'].includes(el)}) as currency}
                                <span class="uppercase font-bold tag bg-fade text-primary rounded">{Math.round(balances[balance][currency]*1e6)/1e6} {currency}</span>
                            {/each}
                        </p>
                    </div>
                {/each}
            </div>
        </div>
        <div class="w-full md:w-1/2 lg:w-1/3">
            {#each data.slice(0, 10) as transaction}
                <Transaction {transaction} on:data={e => doc = e.detail}/>
            {/each}
        </div>
    </div>

</div>


<div class="absolute bottom-0 left-0 right-0 flex items-end justify-around py-2 bg-transparent">
    <Icon icon="add" classes="w-12 h-12 -mt-8 hover:text-primary bg-transparent text-fade dark:text-back" on:clicked={()=>doc={type: 'transaction'}}/>
</div>

{#if doc}
    <Form {doc} {user} on:close={()=>doc=null} {users} {data}/>
{/if}

