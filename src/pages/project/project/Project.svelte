<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import Milestone from "../milestone/Milestone.svelte";
    import Icon from "../../../components/Icon.svelte";
    import QuickTask from "../task/QuickTask.svelte";
    import Tasks from "../task/Tasks.svelte";
    import {listenDataFor} from "../../../firebase";
    export let project;
    export let data = [];

    listenDataFor('PM', project, res => {
        data = [];
        res.forEach(snapshot => {
            let doc = snapshot.data();
            ['starting', 'ending', 'done'].forEach(val => {
                if (doc[val]) doc[val] = doc[val].toDate();
            })
            data.push(doc)
        })
    })

</script>

<div class="full-overlay">

    <div class="flex justify-between group">
        <h1 class="text-lg font-bold flex items-center" style="color: {project.color}">
            {#if project.created}
                <Icon on:clicked={()=>dispatch('data', {type: 'milestone', project: project.id, color: project.color, starting: project.starting})} icon="add" classes="h-6 w-6 text-white bg-primary p-0.5 rounded-full m-2"/>
            {/if}
            {project.name}
        </h1>
        {#if project.description}
            <div class="absolute bg-back rounded p-2 hidden group-hover:inline mt-8">
                {@html project.description}
            </div>
        {/if}
    </div>

    <QuickTask on:data={e=>dispatch('data', {...e.detail, project: project.id})} />
    <Tasks on:data={e=>dispatch('data', e.detail)} tasks={data.filter(doc => {return doc.type === 'task' && !doc.milestone})}/>

    {#each data.filter(doc => {return doc.type==='milestone' && !doc.milestone}) as milestone}
        <Milestone on:data={e=>dispatch('data', {...e.detail, project: project.id})} {milestone} {data}/>
    {/each}

    <div class="h-8 text-center">
    </div>

</div>
