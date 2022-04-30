<!--<script>-->
<!--    import {deleteData, getData, listenData, logOut, saveUser, updateData} from "../firebase";-->
<!--    import Icon from "../components/Icon.svelte";-->
<!--    import Pop from "../components/Pop.svelte";-->

<!--    let users = [];-->
<!--    listenData("users", res => {-->
<!--        users = [];-->
<!--        res.forEach(user => users.push(user.data()))-->
<!--    })-->
<!--    let user;-->

<!--    function findUser() {-->
<!--        if (!user || user.name.length < 5) return null;-->
<!--        getData(`users/${user.name}`).then(res => {-->
<!--            console.log(res.data())-->
<!--            if (res.exists) {-->
<!--                user.user = res.id;-->
<!--                user.name = res.data().name-->
<!--            }-->
<!--        })-->
<!--    }-->

<!--    function addUser() {-->
<!--        (user.id?updateData(`users/${user.id}`, user):saveUser(user)).then(()=> console.log('saved user'))-->
<!--        user = null-->
<!--    }-->
<!--    function deleteUser(){-->
<!--        deleteData(`users/${user.id}`)-->
<!--        user = null-->
<!--    }-->
<!--</script>-->

<!--<button on:click={()=>logOut().finally(()=>location.href='/')}  class="button">-->
<!--    Sign Out-->
<!--</button>-->

<!--<div class="mt-4">-->
<!--    Users you have added:-->
<!--</div>-->
<!--<div class="flex flex-wrap items-center m-4">-->
<!--    {#each users as u}-->
<!--        <span on:click={()=>user=u} class="cursor-pointer tag">{u.name}</span>-->
<!--    {/each}-->
<!--    <Icon icon="add" on:clicked={()=>user={}} classes="h-8 w-8 icon mx-4"/>-->
<!--</div>-->

<!--{#if user}-->
<!--    <Pop on:close={()=>user=null}>-->
<!--        <input bind:value={user.name} on:keydown={e => e.key === 'Enter' && findUser()} class="input mb-2 w-full" aria-label="User Adding" type="text">-->
<!--        {#if user.user}-->
<!--            <textarea bind:value={user.description} aria-label="description" cols="30" rows="5" placeholder="More details about the user" class="w-full input"></textarea>-->
<!--            <button class="button" on:click={addUser}>Save</button>-->

<!--            <div class="{user.id?'flex':''} justify-between text-center mt-8">-->
<!--                {#if user.id}-->
<!--                    <button class="button-s" on:click={deleteUser}>Delete</button>-->
<!--                {/if}-->
<!--                <button class="button" on:click={addUser}>Save</button>-->
<!--            </div>-->
<!--        {:else}-->
<!--            <div>Find User by ID</div>-->
<!--        {/if}-->
<!--    </Pop>-->
<!--{/if}-->