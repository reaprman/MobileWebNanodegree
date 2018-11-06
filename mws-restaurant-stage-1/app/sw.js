import idb from 'idb';
const database = 'restaurant-db';
const storeName = 'restaurants';
const review_store = 'reviews';

const dbPromise = idb.open(database, 1, upgradeDb => {
  switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore(storeName, { keyPath: 'id' });
        let keyValStore = upgradeDb.createObjectStore(review_store, { keypath: 'id' });
        keyValStore.createIndex('restaurant_id', 'restaurant_id');

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
              '/manifest.json',
              '/sw.js',
              '/css/styles.css',
              '/js/dbhelper.js',
              '/js/idb.js',
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
        return response || fetch(event.request).then(response => {
          return caches.open(appCache).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          })
        })
      }));
    }
  });

  const handleReviewEvent = (id, event) => {
    event.respondWith(
      dbPromise.then(db => {
        return db.transaction(review_store)
        .objectStore(review_store).index('restaurant_id').getAll(id);
      }).then(reviews => {
        if(!reviews.length > 0) {
          console.log(`SW-Review No reviews in idb`);
          return fetch(event.request).then(response => {
            return response.json();
          }).then(reviews => {
             return dbPromise.then(db =>{
              const tx = db.transaction(review_store, 'readwrite');
              const revStore = tx.objectStore(review_store);
              reviews.forEach(review => {
                revStore.put(review, review.id);
              });
              return reviews;
             });
          })
        }else{
          console.log(`SW-Review info from DB: ${JSON.parse(reviews)}`);
          return reviews;
        }
      }).then(finalResponse => {
        return new Response(JSON.stringify(finalResponse));
      }).catch(error =>{
        return new Response(`Error fetching data ${error} ${{status: 500}}`);
      })
    )
  }

  const handleRestaurantEvent= (event) => {
    event.respondWith(
      dbPromise.then(db => {
        return db.transaction(storeName)
        .objectStore(storeName).getAll();
      }).then(restaurants => {
        if (!restaurants.length > 0) {
          return fetch(event.request).then(response => {
            return response.json();
          }).then(restaurants => {
              return dbPromise.then(db => {
                let tx = db.transaction(storeName,'readwrite');
                let restStore = tx.objectStore(storeName);
                //console.log(`JSON info for DB: ${restaurants}`);
                restaurants.forEach(restaurant =>{ 
                  restStore.put(restaurant, restaurant.id);
                });
                return restaurants
              });
            })
        } else {
          //console.log(`DATA from DB: ${restaurants}`);
          return restaurants; 
        }
      }).then(finalResponse => {
        return new Response(JSON.stringify(finalResponse));
      }).catch(error => {
        return new Response(`Error fetching data ${error} ${{status: 500}}`);
      })
    );
  }

  const handleDatabase = (event) => {
    if(event.request.method !== 'GET') return;
    if(event.request.url.indexOf("reviews") > -1){
      const url = new URL(event.request.url);
      const id = url.searchParams.get("restaurant_id") * 1;
      handleReviewEvent(id, event);
    }else{
      handleRestaurantEvent(event);
    }
  }