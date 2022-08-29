<script>
    import {deleteData, listenData, saveData} from "../../firebase";
    import Form from "./Form.svelte";
    import Calendar from 'tui-calendar';
    import "tui-calendar/dist/tui-calendar.css";
    import {onMount} from "svelte";
    import Transaction from "./Transaction.svelte";

    export let user;
    export let users;
    export let search;

    let data = [];
    let transactions = [];
    let balances = {'total': {}};

    const listTransaction = doc => {
        if (!search || (doc.name + doc.description).toLowerCase().includes(search.toLowerCase())){
            if (!balances[doc.source]) balances[doc.source] = {}
            if (!balances[doc.source][doc.currency]) balances[doc.source][doc.currency] = 0
            if (!balances.total[doc.currency]) balances.total[doc.currency] = 0

            balances[doc.source][doc.currency] = balances[doc.source][doc.currency] + doc.amount
            balances[doc.source].color = doc.color;
            balances.total[doc.currency] = balances.total[doc.currency] + doc.amount

            if (doc.transfer) {
                if (!balances[doc.transfer]) balances[doc.transfer] = {}
                if (!balances[doc.transfer][doc.currency]) balances[doc.transfer][doc.currency] = 0
                balances[doc.transfer][doc.currency] = balances[doc.transfer][doc.currency] - doc.amount
            }


            let shared = [];
            Object.keys(doc.users).forEach(u => {
                if (u !== user.uid) shared.push(users.find(el => el.user === u)?.name)
            })

            transactions.push({ // check attendees, recurrence rule
                id: doc.id,
                title: doc.name,
                tags: doc.tags,
                amount: doc.amount,
                currency: doc.currency,
                calendarId: 'calendar',
                category: 'allday',
                isPending: new Date() < doc.done,
                body: doc.amount,
                start: doc.done || doc.created,
                end: doc.done || doc.created,
                bgColor: doc.color,
                color: '#10162A',
                dragBgColor: "#FF5964",
                borderColor: doc.color,
                attendees: shared
            })
        }
    }
    $: {
        console.log(search)
        transactions = [];
        balances = {'total': {}};
        data.forEach(doc => listTransaction(doc))
        transactions =  transactions;
        if (calendar) {
            calendar.clear();
            calendar.createSchedules(transactions)
        }
    }

    listenData('MM', res => {
        data = [];
        transactions = [];
        balances = {'total': {}};
        res.forEach(snapshot => {
            let doc = snapshot.data();
            ['created', 'done'].forEach(val => {
                if (doc[val]) doc[val] = doc[val].toDate();
            })
            listTransaction(doc)
            data.push(doc)
        })
        data.sort((a, b) => b.created - a.created)

        if (calendar) {
            calendar.clear();
            calendar.createSchedules(transactions)
        }

    })

    function refresh() {
        setTimeout(() => {
            data = data;
            refresh();
        }, 60000)
    }

    refresh()

    let doc;

    let calendar;
    onMount(() => {
        calendar = new Calendar('#calendar', {
            usageStatistics: false,
            defaultView: 'month',
            useDetailPopup: true,
            disableClick: true,
            taskView: false,
            scheduleView: true,
            useCreationPopup: false,
        });
        calendar.createSchedules(transactions);
        calendar.on({
            'beforeUpdateSchedule': function (event) {
                console.log('editing')
                doc = data.find(el => el.id === event.schedule.id)
            },
            'beforeCreateSchedule': function (event) {
                doc = {type: 'transaction', done: new Date(event.start)}
                return true;
            },
            'beforeDeleteSchedule': function (event) {
                let schedule = event.schedule;
                let doc = data.find(el => el.id === schedule.id)
                calendar.deleteSchedule(schedule.id, schedule.calendarId);
                deleteData(doc)
            }
        });
    })

    let list = false;
</script>

<div class="w-full p-4 pb-12">

    <div class="flex overflow-auto flex-none pb-3">
        {#each Object.keys(balances.total) as currency}
            <p class="uppercase font-bold py-1 px-4 mr-2 border rounded rounded-lg text-primary md:text-lg">{ Math.floor(balances.total[currency]*1e4)/1e4 } {currency}</p>
        {/each}
    </div>

    <div id="calendar"></div>
    <div class="nav_buttons flex justify-center">
        <button on:click={()=>calendar.prev()}>P</button>
        <button on:click={()=>calendar.next()}>N</button>
    </div>

    <div class="my-6 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {#each Object.keys(balances).filter(el => {return el !== 'total'}) as balance}
            <div class="card bg-primary text-2xl p-2 cursor-pointer m-2 flex-wrap" style="background-color: {balances[balance].color}">
                <p class="pb-2">{balance}</p>
                <p class="flex flex-wrap items-center">
                    {#each Object.keys(balances[balance]).filter(el => {return !['color'].includes(el)}) as currency}
                        <span class="uppercase font-bold tag bg-fade text-primary rounded">{Math.round(balances[balance][currency]*1e6)/1e6} {currency}</span>
                    {/each}
                </p>
            </div>
        {/each}
    </div>

    <button class="button ml-2" on:click={()=>list=!list}>List</button>
    {#if list}
        <div class="grid grid-cols-1 md:grid-cols-2">
            {#each transactions as transaction}
                <Transaction {transaction}/>
            {/each}
        </div>
    {/if}

</div>

{#if doc}
    <Form {doc} {user} on:close={()=>doc=null} {users} {data}/>
{/if}

<style>
    .nav_buttons button {
        @apply font-bold text-white m-2 px-2 bg-primary rounded-full w-8 h-8 text-center;
    }
</style>

