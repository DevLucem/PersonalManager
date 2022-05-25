<script>
    import Tasks from "./task/Tasks.svelte";
    import Calendar from "./Calendar.svelte";
    import Projects from "./project/Projects.svelte";
    import {listenData} from "../../firebase";
    import Form from "./Form.svelte";
    import QuickTask from "./task/QuickTask.svelte";
    import Icon from "../../components/Icon.svelte";

    export let user;
    export let users;
    $: console.log(users, 'users')

    let data = [];
    listenData('PM', res => {
        data = [];
        const addData = (doc) => {
            ['starting', 'ending', 'done'].forEach(val => {
                if (doc[val]) doc[val] = doc[val].toDate();
            })
            data.push(doc)
        }
        res.forEach(snapshot => {
            let doc = snapshot.data();
            addData(doc);
        })
        data.filter(el => {
            return el.users[0] !== user.uid && el.type !== 'project' && el.project
        }).forEach(doc => {
            if (!data.find(el => el.id === doc.project)) data.push({
                name: "Project",
                id: doc.project,
                type: "project",
                users: [], tags: []
            })
            if (doc.milestone && !data.find(el => el.id === doc.milestone)) data.push({
                name: "Milestone",
                id: doc.milestone,
                project: doc.project,
                type: "milestone",
                users: [], tags: []
            })
        })
        let priority = data.filter(doc => {
            return doc.ending
        }).sort((a, b) => a.ending - b.ending)
        data = [...priority, ...data.filter(doc => {
            return !doc.ending
        })]
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
    let pins = [];
</script>

<div class="w-full p-4 lg:flex overflow-auto pb-12">
    <div class="lg:w-1/2 xl:w-1/3">
        <QuickTask on:data={e => doc=e.detail}/>
        <Tasks {user} on:data={e => doc=e.detail} tasks={data.filter(doc => {return doc.type==='task' && !doc.project && !doc.repeat && (!doc.ending || doc.ending>=new Date())})}/>
        <Tasks {user} on:data={e => doc=e.detail} tasks={data.filter(doc => {return doc.type==='task' && doc.ending && !doc.repeat && doc.ending<new Date()})}/>
    </div>
    <div class="flex-1">
        <div class="ml-4 flex flex-wrap">
            {#each pins as pin}
                <div>
                    <p class="flex items-center text-sm bg-white mt-1">
                        <Icon icon="cancel" classes="h-4 w-4 ml-1 hover:text-secondary" on:clicked={()=>pins = pins.filter(p => p!==pin)}/>
                        {data.find(el => el.id===pin)?.name}
                    </p>
                    <Tasks on:data={e => doc=e.detail} tasks={data.filter(doc => {return doc.type==='task' && doc.milestone === pin})}/>
                </div>
            {/each}
        </div>
        <Projects {user} on:data={e => e.detail.pin? (!pins.includes(e.detail.pin) ? pins = [...pins, e.detail.pin] : pins = pins.filter(el => {return el !== e.detail.pin})): e.detail.calendar? calendar=e.detail.calendar :doc=e.detail} data={data.filter(doc => {return (doc.type!=='task' || doc.project) && !doc.repeat})}/>
    </div>
</div>

<div class="absolute bottom-0 left-0 right-0 flex items-end justify-around py-2 bg-transparent">

    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 hover:text-primary text-fade hover:cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
        <title>Manage Account</title>
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
    </svg>

    <Icon icon="add" classes="w-12 h-12 -mt-8 hover:text-primary bg-transparent text-fade" on:clicked={()=>doc={type: 'project'}}/>

    <Icon icon="calendar" classes="w-8 h-8 hover:text-primary text-fade" on:clicked={()=>calendar='all'}/>

</div>

{#if calendar}
    <Calendar on:data={e => doc=e.detail} {data} filter={calendar} on:close={()=>calendar=''}/>
{/if}

{#if doc}
    <Form {doc} {user} on:close={()=>doc=null} {users} {data}/>
{/if}
