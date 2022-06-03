<script>
    import {createEventDispatcher} from 'svelte';

    let dispatch = createEventDispatcher();

    import showdown from "showdown";
    import Icon from "../../components/Icon.svelte";
    import {deleteData, getData, saveData} from "../../firebase";
    import Pop from "../../components/Pop.svelte";
    import Form from "./Form.svelte";

    export let data;

    export let doc;
    let isTask = doc.type === 'task';
    let timeExpiry = ['milestone', 'task'].includes(doc.type);
    export let users = [];
    export let user;

    let edit;
    let starting;
    let ending;

    const setColor = () => {
        doc.color = '#';
        for (let i = 0; i < 3; i++)
            doc.color += isTask ? ("0" + Math.floor(Math.random() * Math.pow(16, 2) / 2).toString(16)).slice(-2) :
                ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
    }
    const structureDate = () => {
        let start = starting ? new Date(starting) : doc.starting;
        if (start) starting = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().substring(0, timeExpiry ? 19 : 10);
        let end = ending ? new Date(ending) : doc.ending;
        if (end) ending = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().substring(0, timeExpiry ? 19 : 10);
    }
    structureDate();

    const setUsers = () => {
        doc.users = data.find(el => el.id===(doc.milestone || doc.project))?.users
        doc.users[user?.uid] = 1;
    }
    if (!doc.color) setColor();
    if (doc.description) doc.description = new showdown.Converter().makeMarkdown(doc.description)
    if (!doc.users) {
        if (doc.milestone || doc.project) setUsers();
        if (!doc.users)
            doc.users = {};
    }
    if (!doc.tags) doc.tags = [];

    function save() {
        if (doc.name && doc.name.length > 2) {

            if (doc.description) doc.description = new showdown.Converter().makeHtml(doc.description.trim())
            const timeUpdate = (field, value) => {
                if (value) {
                    doc[field] = new Date(value);
                    doc[field].setSeconds(0);
                } else doc[field] = null;
            }
            timeUpdate('starting', starting)
            timeUpdate('ending', ending)

            if (!doc.project) doc.project = null;
            if (!doc.milestone) doc.milestone = null;

            saveData(doc).catch(e => console.error('ERROR:', e))
                .then(() => console.log('saved doc', doc.name))
            dispatch('close')

        } else edit = true;
    }

    function duration(hours, minutes) {
        if (!starting && !ending) {
            starting = new Date();
            if (starting.getMinutes() > 30) starting.setHours(starting.getHours() + 1)
            starting.setMinutes(0)
            starting.setSeconds(0, 0)
            ending = new Date(starting)
            ending.setHours(ending.getHours() + hours)
            ending.setMinutes(ending.getMinutes() + minutes)
        } else if (ending) {
            ending = new Date(ending);
            ending.setHours(ending.getHours() + hours)
            ending.setMinutes(ending.getMinutes() + minutes)
        } else {
            ending = new Date(starting);
            ending.setHours(ending.getHours() + hours)
            ending.setMinutes(ending.getMinutes() + minutes)
            if (ending < starting) ending = new Date(starting);
        }
        structureDate();
    }

    function remove() {
        deleteData(doc).then(() => console.log('deleted doc'))
        dispatch('close')
    }

    let addUser;
    function findUser() {
        let id = prompt("Enter User ID:")
        if (id && id.length > 5)
            getData(`users/${id}`).then(res => {
                let data = res.data();
                if (res.exists) addUser = {
                    name: data.name,
                    user: data.id,
                    type: 'user'
                }
            })
    }

    if (!doc.id && isTask) setTimeout(save, 10)
    else edit = true;
</script>

{#if edit}
    <Pop on:close={()=>dispatch('close')}>
        <form on:submit|preventDefault={save}>
            <input bind:value={doc.name} class="input mb-2 w-full" aria-label="Name" type="text" placeholder="Name" required>
            <textarea bind:value={doc.description} aria-label="Description" cols="30" rows="5" placeholder="A little more optional details" class="w-full input"></textarea>
            <div class="flex flex-wrap items-center my-2">
                {#each doc.tags as tag}
                    <span class="tag uppercase font-bold bg-primary flex items-center p-1" style="background-color: {tag.substring(tag.indexOf('#')+1)}">
                        {tag.split('#')[0]}
                        <Icon icon="cancel" classes="h-4 w-4 ml-1 hover:text-white" on:clicked={()=>doc.tags = doc.tags.filter(el => el !== tag)}/>
                    </span>
                {/each}
            </div>
            {#if doc.type !== 'user'}
                {#if timeExpiry}
                    <div class="flex flex-col sm:flex-row items-center justify-between">
                        <input class="w-full" type="datetime-local" aria-label="Starting" bind:value={starting} on:change={() => {if(!starting) doc.repeat = false}}>
                        <span class="m-4 font-bold">to</span>
                        <input class="w-full" type="datetime-local" aria-label="Ending" bind:value={ending} on:change={() => {if(!ending) doc.repeat = false}}>
                    </div>
                    <div class="flex justify-between mt-4 mb-8">
                        <button type="button" class="tag bg-primary" on:click={()=>duration(1, 0)}>+1Hr</button>
                        <button type="button" class="tag bg-primary" on:click={()=>duration(-1, 0)}>-1hr</button>
                        {#if starting && ending}
                            <label>Repeat Daily: <input type="checkbox" bind:checked={doc.repeat}></label>
                        {/if}
                    </div>
                {:else}
                    <div class="flex items-center justify-between">
                        <input type="date" aria-label="Starting" bind:value={starting} max={ending}>
                        <span class="m-4 font-bold">to</span>
                        <input type="date" aria-label="Ending" bind:value={ending} min={starting}>
                    </div>
                {/if}
                {#if (!doc.id || doc.users[user?.uid]<3)}
                    <div class="flex flex-wrap items-center my-2">
                        {#each Object.keys(doc.users).filter(el => {return el!==user.uid && doc.users[el]}) as user}
                            <span class="px-2 py-1 bg-primary rounded flex items-center" style="background-color: {users.find(el => el.user===user)?.color}">
                                {users.find(el => el.user===user)?.name}
                                <Icon icon="cancel" classes="h-4 w-4 hover:text-white" on:clicked={()=>doc.users[user]=null}/>
                            </span>
                        {/each}
                        <Icon icon="add" classes="h-6 w-6 m-2 icon group-hover:border-primary" on:clicked={findUser}/>
                        {#each users.filter(el => {return !doc.users[el.user]}) as user}
                            <div class="flex items-center rounded border">
                                <button type="button" on:click={()=>doc.users[user.user]=3} class="m-1 truncate hover:text-primary">{user.name}</button>
                                <Icon icon="cancel" classes="h-4 w-4 hover:text-white m-1" on:clicked={()=>deleteData(user)}/>
                            </div>
                        {/each}
                    </div>
                {/if}
                {#if doc.type !== 'project'}
                    <div class="flex justify-between flex-col md:flex-row">
                        <select aria-label="Project" class="flex-1" bind:value={doc.project} on:change={()=>{doc.milestone=null; setUsers()}}>
                            <option class="text-primary" value="">Select Project</option>
                            {#each data.filter(el => {return el.type === 'project'}) as p}
                                <option value="{p.id}">{p.name}</option>
                            {/each}
                        </select>
                        {#if doc.project}
                            <select aria-label="Milestone" class="flex-1" bind:value={doc.milestone} on:change={()=>setUsers()}>
                                <option class="text-primary" value="">Select Milestone</option>
                                {#each data.filter(el => {return el.project === doc.project && el.type === 'milestone'}) as m}
                                    <option value="{m.id}">{m.name}</option>
                                {/each}
                            </select>
                        {/if}
                    </div>
                {/if}
            {/if}
            <div class="flex justify-between mt-8">
                {#if doc.id && doc.users[user?.uid]<3}
                    <button type="button" class="button-s" on:click={remove}>Delete</button>
                {/if}
                <div class="flex items-center">
                    <input aria-label="Color" type="color" bind:value={doc.color} placeholder="Color">
                    <Icon icon="refresh" classes="w-6 h-6 ml-4" on:clicked={setColor}/>
                </div>
                <button type="submit" class="button" on:click={save}>Save</button>
            </div>
        </form>
    </Pop>
    {#if addUser}
        <Form doc={addUser} on:close={()=>addUser=null}/>
    {/if}
{/if}