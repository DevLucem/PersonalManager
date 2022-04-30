<script>
    import Tasks from "./task/Tasks.svelte";
    import Calendar from "./Calendar.svelte";
    import Projects from "./project/Projects.svelte";
    import {listenData} from "../../firebase";
    import Form from "./Form.svelte";
    import QuickTask from "./task/QuickTask.svelte";

    export let user;

    let data = [];
    listenData('PM', res => {
        data = [];
        res.forEach(snapshot => {
            let doc = snapshot.data();
            ['starting', 'ending', 'done'].forEach(val => {
                if (doc[val]) doc[val] = doc[val].toDate();
            })
            data.push(doc)
        })
        data.filter(el => {return el.users[0] !== user.uid && el.type !== 'project' && el.project}).forEach(doc => {
            if (!data.find(el => el.id===doc.project)) data.push({
                name: "Shared Project",
                id: doc.project,
                type: "project",
                users: [],
            })
            if (doc.milestone && !data.find(el => el.id===doc.milestone)) data.push({
                name: "Shared Milestone",
                id: doc.milestone,
                project: doc.project,
                type: "milestone",
                users: [],
            })
        })
    })

    function refresh(){
        setTimeout(()=> {
            data = data;
            console.log('refresh')
            refresh();
        }, 60000)
    } refresh()

    let doc;
    let calendar;
</script>

<div class="w-full p-4 lg:flex overflow-auto pb-12">
    <div class="lg:max-w-prose">
        <QuickTask on:data={e => doc=e.detail}/>
        <Tasks on:data={e => doc=e.detail} tasks={data.filter(doc => {return doc.type==='task' && !doc.project && !doc.repeat})}/>
    </div>
    <Projects on:data={e => doc=e.detail} data={data.filter(doc => {return (doc.type!=='task' || doc.project) && !doc.repeat})}/>
</div>

<div class="absolute bottom-0 left-0 right-0 flex items-end justify-around py-2 bg-transparent">

    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 hover:text-primary text-fade hover:cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
        <title>Manage Account</title>
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
    </svg>

    <button on:click={()=>doc={type: 'project'}} class="-mt-8 hover:text-primary bg-transparent text-fade">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
        </svg>
    </button>

    <button on:click={()=>calendar=true} class="hover:text-primary text-fade">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
        </svg>
    </button>

</div>

{#if calendar}
    <Calendar on:data={e => doc=e.detail} {data} on:close={()=>calendar=false}/>
{/if}

{#if doc}
    <Form {doc} {user} on:close={()=>doc=null} users={data.filter(doc => {return doc.type === 'user'})}/>
{/if}
