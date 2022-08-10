<script>
    import {fade, scale} from 'svelte/transition';
    import Icon from "../../components/Icon.svelte";
    import Form from "./Form.svelte";

    export let user;
    export let users;

    let doc;
</script>

<div class="mx-4">
    <div class="card p-2 cursor-pointer hover:shadow-none duration-300 hover:bg-white mt-4 bg-primary flex flex-col items-center justify-center" in:scale on:click={()=>doc={type: 'user'}}>
        <Icon icon="add" classes="h-8 w-8" on:clicked={()=>doc={type: 'user'}}/>
        <p>Add New</p>
    </div>

    {#each users as contact}
        <div class="flex justify-between items-center bg-white p-2 my-2 hover:bg-back rounded group" in:fade style="background-color: {contact.color}">
            <div class="group relative flex-1">
                <p>
                    {contact.name}
                    {#each contact.tags as tag}
                        <span class="tag uppercase font-bold bg-primary" style="background-color: {tag.substring(tag.indexOf('#')+1)}">{tag.split('#')[0]}</span>
                    {/each}
                </p>
                <div class="tag-line -mt-0.5">{contact.description || ''}</div>
            </div>
            <div class="flex items-center">
                <Icon icon="edit" classes={'h-4 w-4 group-hover:visible hover:text-primary'} on:clicked={()=>doc = contact}/>
            </div>
        </div>
    {/each}
</div>

{#if doc}
    <Form {doc} {user} on:close={()=>doc=null} {users}/>
{/if}