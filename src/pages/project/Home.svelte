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
    export let search;

    let data = [];
    let allData = [];

    const filterData = () => {
        data = [];
        if (!search) data = allData;
        else allData.forEach(doc => {
            if ((doc.name + " " + doc.description).toLowerCase().includes(search.toLowerCase()) && (doc.type === 'task' || data.filter(el => {return el.id === doc.id}).length<1)) {
                data.push(doc);

                const getRoots = child => {

                    if (child.milestone) {
                        allData.filter(el => {return el.id === child.milestone}).forEach(add => {
                            if (data.filter(el => {return el.id === add.id}).length<1)
                                data.push(add)
                            getRoots(add)
                        })
                    }else if (child.project){
                        allData.filter(el => {return el.id === child.project}).forEach(add => {
                            if (data.filter(el => {return el.id === add.id}).length<1)
                                data.push(add)
                            getRoots(add)
                        })
                    }

                }

                getRoots(doc)
            }
        })
        data = data;
        console.log(data.length)
    }

    listenData('PM', res => {
        allData = [];
        const addData = (doc) => {
            ['starting', 'ending', 'done'].forEach(val => {
                if (doc[val]) doc[val] = doc[val].toDate();
            })
            allData.push(doc)
        }
        res.forEach(snapshot => {
            let doc = snapshot.data();
            if (!doc.done) addData(doc);
        })
        // todo check what this line does
        allData.filter(el => {
            return el.users[0] !== user.uid && el.type !== 'project' && el.project
        }).forEach(doc => {
            if (!allData.find(el => el.id === doc.project)) allData.push({
                name: "Project",
                id: doc.project,
                type: "project",
                users: {}, tags: []
            })
            if (doc.milestone && !allData.find(el => el.id === doc.milestone)) allData.push({
                name: "Milestone",
                id: doc.milestone,
                project: doc.project,
                type: "milestone",
                users: {}, tags: []
            })
        })
        allData.sort((a, b) => a.created - b.created)
        let priority = allData.filter(doc => {
            return doc.ending
        }).sort((a, b) => a.ending - b.ending)
        allData = [...priority, ...allData.filter(doc => {
            return !doc.ending
        })]
        filterData()
    })

    $: {
        console.log(search)
        filterData()
    }

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
        <div class="mt-2 lg:mt-0 lg:ml-4 flex flex-wrap">
            {#each pins as pin}
                <div class="border border-4 rounded rounded-lg mb-2" style="border-color: {data.find(el => el.id===data.find(el => el.id===pin)?.project)?.color}">
                    <p class="flex items-center text-sm font-bold rounded" style="background-color: {data.find(el => el.id===pin)?.color }">
                        <Icon icon="cancel" classes="h-4 w-4 ml-1 hover:text-secondary" on:clicked={()=>pins = pins.filter(p => p!==pin)}/>
                        {data.find(el => el.id===pin)?.name}
                    </p>
                    <Tasks on:data={e => doc=e.detail} tasks={data.filter(doc => {return doc.type==='task' && doc.milestone === pin})}/>
                </div>
            {/each}
        </div>
        <Projects {user} on:data={e => e.detail.pin? (!pins.includes(e.detail.pin) ? pins = [...pins, e.detail.pin] : pins = pins.filter(el => {return el !== e.detail.pin})): e.detail.calendar? calendar=e.detail.calendar :doc=e.detail} data={data.filter(doc => {return (doc.type!=='task' || doc.project)})}/>
    </div>
</div>

<Icon icon="calendar" classes="w-12 h-12 p-1 hover:text-primary absolute right-0 bottom-0 mr-4 mb-2 text-fade dark:text-back" on:clicked={()=>calendar='all'}/>

{#if calendar}
    <Calendar on:data={e => doc=e.detail} {data} {users} {user} filter={calendar} on:close={()=>calendar=''}/>
{/if}

{#if doc}
    <Form {doc} {user} on:close={()=>doc=null} {users} {data}/>
{/if}
