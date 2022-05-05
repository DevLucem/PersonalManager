<script>
    import {createEventDispatcher} from 'svelte';

    let dispatch = createEventDispatcher();

    import showdown from "showdown";
    import Icon from "../../components/Icon.svelte";
    import {deleteData, getData, saveData} from "../../firebase";
    import Pop from "../../components/Pop.svelte";
    import Form from "./Form.svelte";

    export let doc;
    let isTask = doc.type === 'task';
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
        if (start) starting = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().substring(0, isTask ? 19 : 10);
        let end = ending ? new Date(ending) : doc.ending;
        if (end) ending = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().substring(0, isTask ? 19 : 10);
    }
    structureDate();

    if (!doc.color) setColor();
    if (doc.description) doc.description = new showdown.Converter().makeMarkdown(doc.description)
    if (!doc.users) doc.users = [];

    function save() {
        if (doc.name && doc.name.length > 3) {

            if (doc.description) doc.description = new showdown.Converter().makeHtml(doc.description.trim())
            const timeUpdate = (field, value) => {
                if (value) {
                    doc[field] = new Date(value);
                    doc[field].setSeconds(0);
                } else doc[field] = null;
            }
            timeUpdate('starting', starting)
            timeUpdate('ending', ending)

            saveData(doc).catch(e => console.error('ERROR:', e))
                .then(() => console.log('saved doc'))
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
            {#if doc.task !== 'user'}
                {#if isTask}
                    <div class="flex flex-wrap items-center justify-between space-x-2 my-2">
                        <button type="button" class="tag" on:click={()=>duration(0, 30)}>+30Min</button>
                        <button type="button" class="tag" on:click={()=>duration(1, 0)}>+1Hr</button>
                        <button type="button" class="tag" on:click={()=>duration(2, 0)}>+2hr</button>
                        <button type="button" class="tag" on:click={()=>duration(0, -30)}>-30Min</button>
                    </div>
                    <div class="flex flex-col sm:flex-row items-center justify-between">
                        <input type="datetime-local" aria-label="Starting" bind:value={starting}>
                        <span class="m-4 font-bold">to</span>
                        <input type="datetime-local" aria-label="Ending" bind:value={ending}>
                    </div>
                    <label>Repeat Daily: <input type="checkbox" bind:checked={doc.repeat}></label>
                {:else}
                    <div class="flex items-center justify-between">
                        <input type="date" aria-label="Starting" bind:value={starting}>
                        <span class="m-4 font-bold">to</span>
                        <input type="date" aria-label="Ending" bind:value={ending}>
                    </div>
                {/if}
                {#if !doc.id || user?.uid === doc.users[0]}
                    <div class="flex flex-wrap items-center my-2">
                        {#each doc.users.slice(doc.id?1:0) as user}
                        <span class="px-2 py-1 bg-primary rounded flex items-center" style="background-color: {users.find(el => el.user===user)?.color}">
                            {users.find(el => el.user===user)?.name}
                            <Icon icon="cancel" classes="h-4 w-4 hover:text-white" on:clicked={()=>doc.users = doc.users.filter(el => el !== user)}/>
                        </span>
                        {/each}
                        <div class="flex relative w-28 group mx-4">
                            <Icon icon="add" classes="h-8 w-8 icon group-hover:border-primary"/>
                            <div class="w-20 flex flex-col items-start right-0 absolute invisible group-hover:visible">
                                {#each users.filter(el => {return !doc.users.includes(el.user)}) as user}
                                    <button type="button" on:click={()=>doc.users = [...doc.users, user.user]} class="truncate hover:text-primary">{user.name}</button>
                                {/each}
                                <button type="button" on:click={findUser}>Add New</button>
                            </div>
                        </div>
                    </div>
                {/if}
            {/if}
            <div class="flex justify-between mt-8">
                {#if doc.id && user?.uid === doc.users[0]}
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