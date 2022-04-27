<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    import showdown from "showdown";
    import Icon from "../../components/Icon.svelte";
    import {deleteData, saveData} from "../../firebase";
    import Pop from "../../components/Pop.svelte";

    export let doc; let edit;
    let starting; let ending;

    const setColor = () => {
        doc.color = '#';
        for (let i = 0; i < 3; i++)
            doc.color += doc.type === 'task' ? ("0" + Math.floor(Math.random() * Math.pow(16, 2) / 2).toString(16)).slice(-2) :
                ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
    }

    if (doc.starting) starting = new Date(doc.starting.getTime() - doc.starting.getTimezoneOffset() * 60000).toISOString().substring(0, 19);
    if (doc.ending) ending = new Date(doc.ending.getTime() - doc.ending.getTimezoneOffset() * 60000).toISOString().substring(0, 19);
    if (!doc.color) setColor();
    if (doc.description) doc.description = new showdown.Converter().makeMarkdown(doc.description)

    function save() {
        if (doc.name && doc.name.length > 3) {

            if (!doc.tags) doc.tags = []
            let tags = doc.name.split(" ").filter(n => /:/.test(n));
            tags.forEach(sep => {
                doc.name = doc.name.replace(sep, "")
                let tag = sep.replace(":", "")
                if (!doc.tags.includes(tag)) doc.tags.push(tag)
            })

            if (doc.description) doc.description = new showdown.Converter().makeHtml(doc.description.trim())
            const timeUpdate = (field, value) => {
                if (value) {
                    doc[field] = new Date(value);
                    doc[field].setSeconds(0);
                }else doc[field] = null;
            }
            timeUpdate('starting', starting)
            timeUpdate('ending', ending)
            saveData(doc).catch(e => console.error('ERROR:', e))
                .then(() => console.log('saved doc'))
            dispatch('close')

        } else edit = true;
    }

    function remove() {
        deleteData(doc).then(() => console.log('deleted doc'))
        dispatch('close')
    }

    if (!doc.id) setTimeout(save, 10)
    else edit = true;
</script>

{#if edit}
    <Pop on:close={()=>dispatch('close')}>
        <form on:submit|preventDefault={save}>
            <input bind:value={doc.name} class="input mb-2 w-full" aria-label="Name" type="text" placeholder="Name" required>
            <textarea bind:value={doc.description} aria-label="Description" cols="30" rows="5" placeholder="A little more optional details" class="w-full input"></textarea>
            <div class="flex flex-col md:flex-row items-center justify-between">
                <input type="datetime-local" aria-label="Starting" bind:value={starting}>
                <span class="m-4 font-bold">to</span>
                <input type="datetime-local" aria-label="Ending" bind:value={ending}>
            </div>
            <div class="flex flex-wrap items-center">
                <span class="px-2 py-1 bg-primary rounded">User</span>
                <Icon icon="add" classes="h-8 w-8 icon mx-4"/>
            </div>
            <div class="flex justify-between mt-8">
                {#if doc.id}
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
{/if}