<script>
    import {listenData} from "../../firebase";
    import Form from "./Form.svelte";
    import {scale} from 'svelte/transition';
    import Transaction from "./Transaction.svelte";

    export let user;

    let data = [];
    let balances = {'total': {}};
    listenData('MM', res => {
        data = []; balances = {'total': {}};
        res.forEach(snapshot => {
            let doc = snapshot.data();
            ['created', 'done'].forEach(val => {
                if (doc[val]) doc[val] = doc[val].toDate();
            })
            if (!balances[doc.source]) balances[doc.source] = {}
            if (!balances[doc.source][doc.currency]) balances[doc.source][doc.currency] = 0
            if (!balances.total[doc.currency]) balances.total[doc.currency] = 0
            balances[doc.source][doc.currency] = balances[doc.source][doc.currency] + doc.amount
            balances.total[doc.currency] = balances.total[doc.currency] + doc.amount
            data.push(doc)
        })
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

<div class="w-full p-4 lg:flex overflow-auto pb-12">

    <div >
        <Form {doc} {user} on:close={()=>doc=null} />
        {#each data as transaction}
            <Transaction {transaction} on:data={e => doc = e.detail}/>
        {/each}
    </div>

    <div>
        <div class="flex flex-wrap flex-none">
            {#each Object.keys(balances.total) as currency}
                <span class="uppercase font-bold tag bg-fade p-1">{balances.total[currency]}{currency}</span>
            {/each}
        </div>

        <div class="mt-4 mb-6 lg:mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 -m-2 lg:ml-2">
            {#each Object.keys(balances).filter(el => {return el !== 'total'}) as balance}
                <div class="card p-2 cursor-pointer hover:shadow-none duration-300 hover:bg-white m-2" in:scale>
                    {balance}
                    {#each Object.keys(balances[balance]) as currency}
                        <span class="uppercase font-bold tag bg-primary">{balances[balance][currency]}{currency}</span>
                    {/each}
                </div>
            {/each}
        </div>
    </div>

</div>

