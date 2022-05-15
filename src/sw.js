importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

const navigationRoute = new workbox.routing.NavigationRoute(
    new workbox.strategies.NetworkFirst({
        cacheName: 'v2a-navigations'
    })
);
  
const imageAssetRoute = new workbox.routing.Route(({request}) => {
    return request.destination === 'image';
    }, new workbox.strategies.CacheFirst({
        cacheName: 'v2a-image-assets'
    })
);
  
workbox.routing.registerRoute(navigationRoute);
workbox.routing.registerRoute(imageAssetRoute);