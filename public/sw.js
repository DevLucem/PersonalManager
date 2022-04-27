// sw.js

let cache_name = "SimiCart"; // The string used to identify our cache
const assets = [
    "/index.html",
    "/index.css",
    "/index.js",
    "/vendor.js",
    "/svelte.jpg",
]

self.addEventListener("install", event => {
    console.log("installing...");
    event.waitUntil(
        caches
            .open(cache_name)
            .then(cache => {
                return cache.addAll(assets);
            })
            .catch(err => console.log(err))
    );
});

self.addEventListener("fetch", event => {
    if (event.request.url === "https://splitz.web.app/") {
        console.log('fetching', event.request.url)
        // or whatever your app's URL is
        event.respondWith(
            fetch(event.request).catch(err =>
                self.cache.open(cache_name).then(cache => cache.match("/index.html"))
            )
        );
    } else {
        event.respondWith(
            fetch(event.request).catch(err =>
                caches.match(event.request).then(response => response)
            )
        );
    }
});