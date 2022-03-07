<script>
    import {TASKS} from "../../../firebase";
    import {createEventDispatcher } from "svelte"
    import showdown from "showdown";
    export let user;
    export let save;
    const dispatch = createEventDispatcher();
    let task;
    const addTodo = () => {
        if (task.length < 3) return
        let newTask = {
            id: TASKS.doc().id,
            created: new Date(),
            users: [user.uid],
            done: null
        }
        let fTags = [];
        task = new showdown.Converter().makeHtml(" "+task.trim()+" ")
        let tags = task.split(" ").filter(n => /:/.test(n));
        let expiry = null;
        tags.forEach(tag => {
            task = task.replace(tag, "")
            let cmd = tag.substring(0, 2);
            if ([':d', ':h'].includes(cmd)) {
                if (!expiry) expiry = new Date();
                expiry.setMinutes(0);
                let val = parseInt(tag.substring(2, tag.length))
                if (cmd === ':d') expiry.setDate(expiry.getDate() + val)
                if (cmd === ':h') expiry.setHours(val)
                if (expiry < new Date()) expiry.setDate(expiry.getDate() + 1);
            } else if ([":u"].includes(cmd)){
                newTask.users = [...newTask.users, ...tag.substring(2, tag.length).split(",")]
            }else fTags.push(tag.replace(":", ""))
        })
        newTask.tags = fTags;
        newTask.expiry = expiry;
        newTask.name = task;
        save ? TASKS.doc(`${newTask.id}`).set(newTask) : dispatch('task', newTask)
        task = "";
    }
</script>
<input type="text" aria-label="none" class="input m-2 border border-primary" placeholder="Add A Task" on:keypress={e=>{if (e.charCode===13) addTodo()}} bind:value={task}>