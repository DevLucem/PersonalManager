<script>
    import AddButton from "../../../assets/AddButton.svelte";
    import {USERS} from "../../../firebase";
    import Cancel from "../../../assets/Cancel.svelte";

    export let users = [];
    $: console.log(users)
    export let user;
    let showUsers = true;
    let add_user = null;
    let user_id = null;
    const addUser = () => {
        console.log('checking user')
        if (add_user.id) {
            USERS.doc(add_user.id).set(add_user).then(() => {
                add_user = null;
                user_id = null;
            })
        } else if (user_id && user_id.trim().length > 3) {
            console.log('fetching user id')
            USERS.doc(user_id).get().then(doc => {
                console.log(doc.data())
                if (!doc.exists) return;
                let u = doc.data()
                if (u.created) {
                    add_user = {
                        name: u.name,
                        description: '',
                        id: USERS.doc().id,
                        user: u.id,
                        users: [user.uid]
                    }
                }
            })
        }
    }
</script>

<div class="flex bg-fore rounded-2xl text-white items-center justify-between px-4">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 cursor-pointer" viewBox="0 0 20 20" fill="currentColor" on:click={()=>showUsers=!showUsers}>
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
    <h2 class="title flex-1 text-center cursor-pointer py-2" on:click={()=>showUsers=!showUsers}>Users</h2>
    <AddButton on:clicked={()=>add_user={}}/>
</div>

{#if showUsers}
    <div class="flex flex-wrap w-full m-2">
        {#each users as user}
            <div class="w-1/2 card p-4">
                <p class="flex flex-wrap items-center justify-between">
                    <span>{@html user.name}</span>
                    <Cancel on:clicked={()=>USERS.doc(user.id).delete()}/>
                </p>
                <p>{@html user.description}</p>
            </div>
        {/each}
    </div>
{/if}

{#if add_user}
    <div class="absolute top-0 bottom-0 left-0 right-0 bg-gray z-10 backdrop-blur-2xl h-screen flex items-center justify-center">
        <div class="card p-8">
            {#if add_user.id}
                <input aria-label="Name" type="text" class="input" placeholder="Customize name" bind:value={add_user.name}>
                <input aria-label="Description" type="text" class="bg-fore border-0" placeholder="Optional user description" bind:value={add_user.description}>
            {:else}
                <input aria-label="User ID" type="search" class="input" placeholder="Search User ID" bind:value={user_id}>
            {/if}
            <div class="flex justify-between space-x-8">
                <button class="button mt-8" on:click={()=>{add_user=null; user_id=''}}>Cancel</button>
                <button class="button mt-8" on:click={()=>addUser()}>{add_user.id?'Add':'Search'}</button>
            </div>
        </div>
    </div>
{/if}