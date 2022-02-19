<script>
    import {TASK, FIELD_VALUE} from "../../../firebase";
    import Cancel from "../../../assets/Cancel.svelte";
    import Todo from "./Todo.svelte";
    import showdown from "showdown";

    export let todo;
    export let user;
    let schedule = [];
    $: if (todo) {
        schedule = todo.filter(td => td.repeat);
        schedule.sort( (a, b) => b.expiry.toDate().getHours()-a.expiry.toDate().getHours() )
        let current = (new Date()).getHours()
        for (let i=0; i<schedule.length; i++)
            if (current>=schedule[i].expiry.toDate().getHours()){
                let ongoing = [];
                if (i>0) ongoing.push(schedule[i-1])
                ongoing.push(schedule[i])
                if (i<schedule.length-1) ongoing.push(schedule[i+1])
                schedule = ongoing;
                break;
            }
    }

    let quickTodo;
    const addTodo = () => {
        if (quickTodo.length < 3) return
        let newTodo = {
            id: TASK.doc().id,
            created: new Date(),
            user: [user.uid],
            done: null
        }
        let fTags = [];
        quickTodo = new showdown.Converter().makeHtml(quickTodo)
        let tags = quickTodo.split(" ").filter(n => /:/.test(n));
        let expiry = null;
        tags.forEach(tag => {
            quickTodo = quickTodo.replace(tag, "")
            let cmd = tag.substring(0, 2);
            if ([':d', ':h', ':r'].includes(cmd)) {
                if (!expiry) expiry = new Date();
                expiry.setMinutes(0);
                let val = parseInt(tag.substring(2, tag.length))
                if (cmd === ':d') expiry.setDate(expiry.getDate() + val)
                if (cmd === ':h') expiry.setHours(val)
                if (cmd === ':r') newTodo.repeat = val;
                if (expiry < new Date()) expiry.setDate(expiry.getDate() + 1);
                console.log(expiry.getDate(), expiry.getHours())
            } else if ([":u"].includes(cmd)){
                console.log(tag)
                newTodo.user = [...newTodo.user, ...tag.substring(2, tag.length).split(",")]
            }else fTags.push(tag.replace(":", ""))
        })
        console.log(newTodo)
        newTodo.tags = fTags;
        newTodo.expiry = expiry;
        newTodo.name = quickTodo;
        TASK.doc(`${newTodo.id}`).set(newTodo)
        quickTodo = "";
    }
</script>

<div class="card mt-12 pb-1 flex-1">
    <input type="text" aria-label="none" class="input m-2 border border-primary" placeholder="Quick TODO" on:keypress={e=>{if (e.charCode===13) addTodo()}} bind:value={quickTodo}>
    {#if schedule.length>0}
        <div class="text-primary text-center mb-1">
            {#each schedule as td}
                <div class="flex justify-between bg-gray p-2 {td.expiry.toDate().getHours()!==(new Date).getHours()?'opacity-70':''}">
                    <p class="flex-1 flex justify-center">
                        {td.expiry.toDate().getHours()} - {@html td.name}
                        {#each td.tags as tag}
                            <span class="tag text-xs">{tag}</span>
                        {/each}
                    </p>
                    <Cancel on:clicked={()=>TASK.doc(td.id).delete()}/>
                </div>
            {/each}
        </div>
    {/if}
    {#each todo.filter(td=>!td.repeat&&!td.done).sort((a, b) => a.created.toDate()-b.created.toDate()) as td, x}
        <Todo {td} checking={true}/>
    {/each}
    <div class="flex justify-center items-end flex-1">
        <p class="text-center m-2 font-bold text-primary">{new Date().toLocaleDateString('en-US',  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
</div>