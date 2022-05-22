<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();
    import { scale } from 'svelte/transition';
    import Pop from "../../../components/Pop.svelte";
    import Project from "./Project.svelte";
    import Icon from "../../../components/Icon.svelte";

    export let user;
    export let data = [];

    let project;
    let calendar;
</script>

<div class="mt-4 mb-6 lg:mt-2 flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 -m-2 lg:ml-2">
    {#each data.filter(doc => {return doc.type==='project'}) as p}
        <div class="card p-2 cursor-pointer hover:shadow-none duration-300 hover:bg-white m-2" style="background-color: {p.color}" in:scale on:click={()=>project=p}>
            <div class="group flex pb-2 font-bold">
                <h2 class="flex-1">
                    {p.name}
                    {#if p.ending && p.ending < new Date()}
                        <span class="tag uppercase font-bold bg-secondary">late</span>
                    {/if}
                    {#each p.tags as tag}
                        <span class="tag uppercase font-bold bg-primary" style="background-color: {tag.substring(tag.indexOf('#')+1)}">{tag.split('#')[0]}</span>
                    {/each}
                </h2>
                {#if p.created && p.users[user?.uid]<4}
                    <Icon icon="edit" classes="h-5 w-5 invisible group-hover:visible" on:clicked={()=>dispatch('data', p)}/>
                {/if}
                {#if p.created}
                    <Icon icon="calendar" classes="h-5 w-5" on:clicked={()=>dispatch('data', {calendar: p.id})}/>
                {/if}
            </div>
            <div class="m-1">
                <p>{data.filter(doc => {return doc.type==='milestone' && doc.project === p.id}).length } Milestones</p>
                <p>{data.filter(doc => {return doc.type==='task' && doc.project === p.id}).length } Tasks</p>
            </div>
        </div>
    {/each}
</div>

{#if project}
    <Pop on:close={()=>project=null}>
        <Project {user} on:data={e=>dispatch('data', e.detail)} {project} data={data.filter(doc => {return doc.project===project.id})}/>
    </Pop>
{/if}