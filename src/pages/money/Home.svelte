<script>
    import {listenData} from "../../firebase";
    import Form from "./Form.svelte";
    import {scale} from 'svelte/transition';
    import moment from "moment"
    import Transaction from "./Transaction.svelte";

    export let user;

    let data = [];
    let balances = {};
    listenData('MM', res => {
        data = []; balances = {};
        res.forEach(snapshot => {
            let doc = snapshot.data();
            ['created', 'done'].forEach(val => {
                if (doc[val]) doc[val] = doc[val].toDate();
            })
            if (!balances[doc.type]) balances[doc.type] = {...doc.amount}
            else {

            }
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

    <div>
        <Form {doc} {user} on:close={()=>doc=null} />
        {#each data as transaction}
            <Transaction {transaction}/>
        {/each}
    </div>

    <div class="mt-4 mb-6 lg:mt-2 flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 -m-2 lg:ml-2">
        {#each Object.keys(balances) as balance}
            <div class="card p-2 cursor-pointer hover:shadow-none duration-300 hover:bg-white m-2" in:scale>
                <h2 class="group flex pb-2">
                    {balance}
                    {#each Object.keys(balances[balance]) as currency}
                        <span class="tag uppercase font-bold">{balances[balance][currency]}{currency}</span>
                    {/each}
                </h2>
            </div>
        {/each}
    </div>
</div>

