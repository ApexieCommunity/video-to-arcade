importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.NetworkFirst()
);

self.addEventListener("install", function(e) {
    e.waitUntil(
        caches.open("v2a-dynamic").then(function(cache) {
            return cache.addAll([
                "index.html",
                "main.js",
                "css/style.css",
                "logo.png",
                "src/bootstrap.bundle.min.js",
                "src/jquery.min.js",
                "src/m2g/b64.js",
                "src/m2g/GIFEncoder.js",
                "src/m2g/LZWEncoder.js",
                "src/m2g/NeuQuant.js",
                "css/bootstrap.min.css",
                "css/style.css"
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open("v2a-dynamic").then(function(cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function(response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});