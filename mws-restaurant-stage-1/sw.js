var appCache = 'restaurant-cache';
 
 self.addEventListener('install', function(event) {
     event.waitUntil(
         caches.open(appCache).then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/restaurant.html',
                '/css/styles.css',
                '/data/restaurants.json',
                '/img/',
                '/js/',
                '/js/dbhelper.js',
                '/js/main.js',
                '/js/restaurant_info.js',
                '/js/sw_register.js',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
            ]);
         }).catch(function(err) {
             console.log('Cache failed to load: ', err);
         })
     );
 });

/*
To debug fetch code
url: https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker
date: 08/04/18
*/
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response){
            return response || fetch(event.request);
        })
    );
});