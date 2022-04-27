<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();

    let name;
    function addTask(){
        dispatch('data', {name: name, type: 'task'});
        name = '';
    }
</script>


<input bind:value={name} on:keydown={e => e.key === 'Enter' && addTask()} class="input mb-2 w-full" aria-label="Add a quick task" type="text" placeholder="Quick Task or Press Enter For More">