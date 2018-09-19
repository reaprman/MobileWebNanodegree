import idb from 'idb';
const database = 'restaurant-db';
const storeName = 'restaurants';

const dbPromise = idb.open(database, 1, upgradeDb => {
  switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore(storeName, { keyPath: 'id' });
    }
});

let appCache = 'restaurant-cache';

self.addEventListener('install', function(event) {
   event.waitUntil(
         caches.open(appCache).then(function(cache) {
           return cache.addAll([
              '/',
              '/index.html',
              '/restaurant.html',
              '/css/styles.css',
              '/js/',
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
self.addEventListener('fetch', function (event) {
    var urlCheck = new URL(event.request.url);
    // console.log(urlCheck.port);
    if (urlCheck.port === '1337') {
      //go to db and pull resource if there
      //console.log('passed urlCheck');
      handleDatabase(event);
      //else fetch from network look at idb lessons
    } else {
      //only cache if necessary changes needed...
      event.respondWith(
      caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      }));
    }
  });
  

const handleDatabase = (event) => {
  event.respondWith(
        dbPromise.then(db => {
          var tx = db.transaction(storeName);
          var restStore = tx.objectStore(storeName);
          console.log(`Store name pulled form db: ${restStore.name}`);
          return restStore.getAll();
        }).then(restaurants => {
          if (!restaurants.length > 0) {
                //go get data
              return fetch(event.request).then(response => {
                //database
                return response.json().then(restaurants => {
                  dbPromise.then(db => {
                  console.log(`JSON info for DB: ${JSON.stringify(restaurants)}`);
                  var tx = db.transaction(storeName, 'readwrite');
                  var restStore = tx.objectStore(storeName);
                  console.log(`Transaction store submit to Database: ${JSON.stringify(tx.objectStoreNames)}`);
                  restaurants.forEach( restaurant => 
                    restStore.put(restaurant)
                    );
                  })
                })
              })
            }
          return restaurants;
        })
        .then(finalResponse => {
          return new Response(JSON.stringify(finalResponse));
        })
        .catch(error => {
          return new Response('Error fetching data', {status: 500});
        })
    );
    
}