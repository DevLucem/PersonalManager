<script>
    import AddButton from "../../assets/AddButton.svelte";
    import Cancel from "../../assets/Cancel.svelte";
    import Add from "./components/Add.svelte";
    import {MONEY} from "../../firebase";

    export let user;
    let totals = {}; let amount = 0;
    let balances = []; const convert = (value, currency) => {
        if (currency==="btc") return value*42800;
        if (currency==="shib") return value*0.00003;
        if (currency==="axs") return value*82;
        if (currency==="eth") return value*3276.31;
        if (currency==="bit") return value*2;
        if (currency==="bch") return value*382.27;
        if (currency==="doge") return value*0.17;
        if (currency==="ltc") return value*148.58;
        if (currency==="ksh") return value*0.0088;
        return value;
    }
    MONEY.where("user", "==", user.uid).onSnapshot(snapshot => {
        balances = []; totals = {}; amount = 0;
        snapshot.docs.forEach(doc => {
            let bal = doc.data();
            balances = [bal, ...balances]
            Object.keys(bal.amount).forEach(key => {
                totals[key] = (totals[key] || 0) + bal.amount[key]
                amount += convert(bal.amount[key], key)
            })
        })
        amount = Math.round(amount)
    })

    let addBalance = false;
    let editBalance = null;
</script>

<div class="space-y-4 my-16 bg-gray p-8 rounded rounded-xl shadow shadow-2xl">
    <div class="flex justify-between">
        <div class="flex flex-nowrap overflow-x-auto mr-4">
            <div class="whitespace-nowrap font-bold text-white flex items-center text-2xl mr-4">About ${amount} USD </div>
            {#each Object.keys(totals) as amount}
                <div class="bg-fore whitespace-nowrap rounded rounded-xl text-primary font-bold m-2 px-2 items-center uppercase text-lg hover:text-white">{totals[amount]} {amount}</div>
            {/each}
        </div>
        <div class="icon w-12 h-12">
            <AddButton dark={true} on:clicked={()=>addBalance=true}/>
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2">
        {#each balances as bal}
            <div class="card p-4 m-2">
                <div class="flex justify-between">
                    <h3 class="font-bold text-2xl uppercase">{bal.name}</h3>
                    <Cancel on:clicked={()=>MONEY.doc(bal.type).delete()}/>
                </div>
                <div class="mt-4 flex flex-wrap">
                    {#each Object.keys(bal.amount) as amount}
                        <span class="tag">{bal.amount[amount]} {amount}</span>
                    {/each}
                </div>
                <div class="flex-1"></div>
                <button on:click={()=>editBalance=bal} class="border border-gray rounded-xl p-2 font-bold uppercase mt-4">(<span class="text-primary">{Math.round(Object.keys(bal.amount).reduce((a, b) => a + convert(bal.amount[b], b), 0)*100)/100}</span> USD) Edit</button>
            </div>
        {/each}
    </div>
</div>

{#if addBalance || editBalance}
    <div class="bg-gray overflow-auto overscroll-none h-screen z-10 absolute left-0 top-0 opacity-95 w-full" style="backdrop-filter: blur(20px);">
        <div class="contain pt-8 text-center">
            <Cancel on:clicked={()=>{editBalance=addBalance=null}}/>
            <Add {user} {editBalance} on:close={()=>editBalance=addBalance=null}/>
        </div>
    </div>
{/if}