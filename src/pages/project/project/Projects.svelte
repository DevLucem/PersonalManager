<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();
    import Pop from "../../../components/Pop.svelte";
    import Project from "./Project.svelte";
    import Icon from "../../../components/Icon.svelte";

    export let data = [];

    let project;
    let calendar;
</script>


<div class="mt-8 mb-6 lg:mt-2 flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
    {#each data.filter(doc => {return doc.type==='project'}) as p}
        <div class="card p-2 cursor-pointer hover:shadow-none hover:bg-white m-4" style="background-color: {p.color}" on:click={()=>project=p}>
            <h2 class="group flex">
                {@html p.name}
                <Icon icon="edit" classes="h-6 group-hover:visible invisible" on:clicked={e=>dispatch('data', p)}/>
            </h2>
            <ul class="m-1">
                {#each data.filter(doc => {return doc.type==='task' && doc.project === p.id}).slice(0, 5) as task}
                    <li class="text-xs">{@html task.name}</li>
                {/each}
            </ul>
        </div>
    {/each}
</div>

{#if project}
    <Pop on:close={()=>project=null}>
        <Project on:data={e=>dispatch('data', e.detail)} {project} data={data.filter(doc => {return doc.project===project.id})}/>
    </Pop>
{/if}