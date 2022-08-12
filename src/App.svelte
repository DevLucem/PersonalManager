<script>
  if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("/serviceWorker.js")
            .then(() => console.log("Service worker registered!"))
            .catch(err => console.error("Failed to register service worker", err))

  import {listenData, listenUser, logIn} from "./firebase";
  import moment from "moment";

  import "./lib/Tailwind.svelte"
  import "./style.css"
  import router from "page"
  import PM from "./pages/project/Home.svelte";
  import MM from "./pages/money/Home.svelte";
  import CM from "./pages/contact/Home.svelte";
  import SM from "./pages/About.svelte";
  import Loader from "./components/Loader.svelte";

  let current, managers = [
    ["/pm", PM, "Project"],
    ["/mm", MM, "Money"],
    ["/cm", CM, "Contact"],
    ["/sm", SM, "System"],
  ]
  managers.forEach(route => router(route[0], context => {
    current = route[1]
    router.current = router.current;
  }))
  router.redirect("**", "/pm")
  router.start();


  let users = [];
  listenData('UM', res => {
    users = [];
    res.forEach(snap => users.push(snap.data()))
  })

  function refresh() {setTimeout(() => {users = users; refresh();}, 60000)}
  refresh();
  
  async function checkUser() {
    return await new Promise((resolve, reject) => listenUser(res => resolve( res || {'uid': '_public'}) ))
  }

  let search; let SEARCH;
  const changeSearch = () => {
    if (search || search === '') search = null
    else {
      search = '';
      setTimeout(() => SEARCH.focus(), 50)
    }
  }
</script>

<main class="flex flex-col h-screen w-screen relative text-xs md:text-sm lg:text-base">

  <nav class="flex items-center justify-between px-4 border-b font-bold absolute w-full h-16 text-fade z-10 backdrop-blur-sm bg-white/30">
    <h1>{moment().format("Do MMM")}</h1>
    {#if search || search === ''}
      <input bind:this={SEARCH} bind:value={search} type="search" class="input flex-1 outline-primary outline mx-4" aria-label="Search">
    {/if}
    <div class="flex items-center ">
      <button on:click={changeSearch}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </button>
    <label>
      <select class="bg-transparent highlight border-none focus:ring-0" name="Manager" id="manager" bind:value={router.current}  on:change={e=>router(router.current)}>
        {#each managers as manager}
          <option value="{manager[0]}">{manager[2]}</option>
        {/each}
      </select>
    </label>

    </div>
  </nav>

  <section class="flex-1 overflow-auto w-full pt-16 bg-back dark:bg-fade">
    {#await checkUser()}
      <Loader/>
    {:then user}
      {#if user.uid === '_public'}
        <div class="text-center m-4">
          <button class="button" on:click={()=>logIn().then(()=>location.reload())}>Sign In</button>
          <p class="text-secondary m-2">Secure your data by signing in for private use</p>
        </div>
      {/if}
      <svelte:component this={current} {user} {users} {search}/>
    {/await}
    <!--<div class="flex justify-center items-center mt-32">
      Hold tight, Site is upgrading
    </div>-->
  </section>

</main>
