<script>
  if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("/serviceWorker.js")
            .then(() => console.log("Service worker registered!"))
            .catch(err => console.error("Failed to register service worker", err))

  import {listenUser, logIn} from "./firebase";
  import moment from "moment";

  import "./lib/Tailwind.svelte"
  import "./style.css"
  import router from "page"
  import PM from "./pages/project/Home.svelte";
  import MM from "./pages/money/Home.svelte";
  import SM from "./pages/About.svelte";
  import Loader from "./components/Loader.svelte";

  let current, params, managers = [
    ["/pm", PM, "Project"],
    ["/mm", MM, "Money"],
    ["/sm", SM, "System"],
  ]
  managers.forEach(route => router(route[0], context => {
    params = context.params;
    current = route[1]
    router.current = router.current;
  }))
  router.redirect("**", "/pm")
  router.start();

  async function checkUser() {
    return await new Promise((resolve, reject) => listenUser(res => resolve( res || {'uid': '_public'}) ))
  }
</script>

<main class="flex flex-col h-screen w-screen relative text-xs md:text-sm lg:text-base">

  <nav class="flex items-center justify-between px-4 border-b font-bold absolute w-full h-16 text-fade z-10 backdrop-blur-sm bg-white/30">
    <h1>{moment().format("Do MMM")}</h1>
    <label>
      <select class="bg-transparent highlight border-none focus:ring-0" name="Manager" id="manager" bind:value={router.current}  on:change={e=>router(router.current)}>
        {#each managers as manager}
          <option value="{manager[0]}">{manager[2]}</option>
        {/each}
      </select>
      <span class="hidden md:inline">Manager</span>
    </label>
  </nav>

  <section class="flex-1 overflow-auto w-full pt-16 bg-back dark:bg-fade">
    {#await checkUser()}
      <Loader/>
    {:then user}
      {#if user.uid === '_public'}
        <div class="text-center m-4">
          <button class="button" on:click={()=>logIn().then(()=>location.reload())}>Sign In</button>
          <p class="text-secondary m-2">Use a private account by signing in. Your data can be viewed and updated by anyone.</p>
        </div>
      {/if}
      <svelte:component this={current} {params} {user}/>
    {/await}
  </section>

  <button class="absolute icon p-4 right-0 bottom-0 m-8 text-primary hidden">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
      <title>Notes</title>
      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
      <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
    </svg>
  </button>

</main>
