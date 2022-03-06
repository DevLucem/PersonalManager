<script>
    import "./lib/tailwind.svelte";
    import router from "page"
    import "./style.css"
    import PM from "./pages/pm/Home.svelte";
    import MM from "./pages/mm/Home.svelte";
    import firebase from "./firebase";

    let routing; let params; [
        ["/mm**", MM],
        ["/pm**", PM],
    ].forEach(route => router(route[0], (context) => {params = context.params; routing = route[1]}))
    router.redirect("**", "/pm")
    router.start();
    async function getUser(){
        return await new Promise(resolve => firebase.auth().onAuthStateChanged(async auth => resolve(auth ? auth : {uid: '_public'})))
    }
    let manager = router.current;
    router.exit("**", (context, next) => {manager = router.current; next()})
</script>

<main class="backy h-screen py-4 overflow-y-scroll">
    {#await getUser()}
        <div class="flex h-screen text-gray -my-4 justify-center items-center">
            <div class="w-32 h-32">
                <svg version="1.1" id="L1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
            <circle fill="none" stroke="currentColor" stroke-width="6" stroke-miterlimit="15" stroke-dasharray="14.2472,14.2472" cx="50" cy="50" r="47" >
              <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      dur="5s"
                      from="0 50 50"
                      to="360 50 50"
                      repeatCount="indefinite" />
          </circle>
                    <circle fill="none" stroke="currentColor" stroke-width="1" stroke-miterlimit="10" stroke-dasharray="10,10" cx="50" cy="50" r="39">
              <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      dur="5s"
                      from="0 50 50"
                      to="-360 50 50"
                      repeatCount="indefinite" />
          </circle>
                    <g fill="currentColor">
          <rect x="30" y="35" width="5" height="30">
            <animateTransform
                    attributeName="transform"
                    dur="1s"
                    type="translate"
                    values="0 5 ; 0 -5; 0 5"
                    repeatCount="indefinite"
                    begin="0.1"/>
          </rect>
                        <rect x="40" y="35" width="5" height="30" >
            <animateTransform
                    attributeName="transform"
                    dur="1s"
                    type="translate"
                    values="0 5 ; 0 -5; 0 5"
                    repeatCount="indefinite"
                    begin="0.2"/>
          </rect>
                        <rect x="50" y="35" width="5" height="30" >
            <animateTransform
                    attributeName="transform"
                    dur="1s"
                    type="translate"
                    values="0 5 ; 0 -5; 0 5"
                    repeatCount="indefinite"
                    begin="0.3"/>
          </rect>
                        <rect x="60" y="35" width="5" height="30" >
            <animateTransform
                    attributeName="transform"
                    dur="1s"
                    type="translate"
                    values="0 5 ; 0 -5; 0 5"
                    repeatCount="indefinite"
                    begin="0.4"/>
          </rect>
                        <rect x="70" y="35" width="5" height="30" >
            <animateTransform
                    attributeName="transform"
                    dur="1s"
                    type="translate"
                    values="0 5 ; 0 -5; 0 5"
                    repeatCount="indefinite"
                    begin="0.5"/>
          </rect>
          </g>
        </svg>
            </div>
        </div>
    {:then user}
        <div class="contain h-full flex flex-col">
            <div class="flex justify-between">
                <p class="text-center m-2 font-bold text-primary">{new Date().toLocaleDateString('en-US',  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div class="inline-block relative flex items-center mr-4">
                    <select class="-mr-10 bg-fore text-lg uppercase rounded-2xl px-6 pb-1 pt-0.5 text-center font-bold gradient pr-12" bind:value={manager} aria-label="none" name="Feature" id="feature" on:change={()=>router(manager)}>
                        <option class="bg-fore text-white font-bold" value="/pm">Project</option>
                        <option class="bg-fore text-white font-bold" value="/mm">Money</option>
                    </select>
                    <div class="icon pointer-events-none">
                        <svg class="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
            <svelte:component this={routing} {params} {user}/>
            <div class="flex-1 flex items-end justify-center pt-4 pb-8">
                <button class="button opacity-70 hover:opacity-100" on:click={()=>user.email?firebase.auth().signOut().then(()=>window.location.reload()):firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>window.location.reload()).catch( e => console.log(e))}>{user.email ? 'logout ' + user.displayName : 'login'}</button>
            </div>
        </div>
    {/await}
</main>

