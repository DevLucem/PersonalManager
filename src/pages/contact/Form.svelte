<script>
    import {createEventDispatcher} from 'svelte';

    let dispatch = createEventDispatcher();

    import Icon from "../../components/Icon.svelte";
    import {deleteData, saveData} from "../../firebase";
    import Pop from "../../components/Pop.svelte";

    export let doc;
    if (doc) doc = Object.assign({}, doc)
    export let data = [];
    let sources = {};

    data.forEach(el => {
        if (!sources[el.source])
            sources[el.source] = el.color;
    })
    let currencies = [];
    data.forEach(el => {
        if (!currencies.includes(el.currency))
            currencies.push(el.currency)
    })
    currencies = currencies;
    export let users = [];
    export let user;

    const setColor = () => {
        if (!doc.color && sources[doc.source])
            doc.color = sources[doc.source];
        else{
            doc.color = '#';
            for (let i = 0; i < 3; i++)
                doc.color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2)
        }
    }

    if (!doc.color) setTimeout(setColor, 50)
    if (!doc.users) doc.users = {};
    if (!doc.tags) doc.tags = [];

    function save() {
        if (!doc.description) delete doc.description;
        if (doc.name && doc.name.length > 2 && doc.amount !== 0) {
            if (doc.currency.trim().length<2) doc.currency = 'USD'
            else doc.currency = doc.currency.trim().toUpperCase();
            saveData(doc).catch(e => console.error('ERROR:', e))
                .then(() => console.log('saved doc', doc.name))
            dispatch('close')
        }
    }

    function remove() {
        deleteData(doc).then(() => console.log('deleted doc'))
        dispatch('close')
    }

</script>

<Pop on:close={()=>dispatch('close')}>
    <form on:submit|preventDefault={save}>

        {#if !doc.id}
            <div class="flex overflow-auto">
                {#each data.filter(el => {return el.repeat}) as d}
                    <button type="button" on:click={() => doc = (({ name, description, type, amount, color, currency, source, users, tags }) => ({ name, description, type, amount, color, currency, source, users, tags }))(d)} class="rounded px-4 py-2 m-2" style="background-color: {d.color}">{d.name}</button>
                {/each}
            </div>
        {/if}

        <input bind:value={doc.email} class="input mb-2 w-full" aria-label="Email" type="email" placeholder="Email" required>
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
        {#if (!doc.id || doc.users[user?.uid]<3)}
            <div class="flex flex-wrap items-center my-2">
                {#each Object.keys(doc.users).filter(el => {return el!==user.uid && doc.users[el]}) as user}
                            <span class="px-2 py-1 bg-primary rounded flex items-center" style="background-color: {users.find(el => el.user===user)?.color}">
                                {users.find(el => el.user===user)?.name}
                                <Icon icon="cancel" classes="h-4 w-4 hover:text-white" on:clicked={()=>doc.users[user]=null}/>
                            </span>
                {/each}
                {#each users.filter(el => {return !doc.users[el.user]}) as user}
                    <div class="flex items-center rounded border">
                        <button type="button" on:click={()=>doc.users[user.user]=3} class="m-1 truncate hover:text-primary">{user.name}</button>
                        <Icon icon="cancel" classes="h-4 w-4 hover:text-white m-1" on:clicked={()=>deleteData(user)}/>
                    </div>
                {/each}
            </div>
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