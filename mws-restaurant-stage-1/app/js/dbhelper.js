const database = 'restaurant-db';
const review_store = 'reviews';
const storename = 'restaurants';
const dbPromise = idb.open(database, 1, upgradeDb => {
  switch (upgradeDb.oldVersion) {
    case 0:
      upgradeDb.createObjectStore(storename, {keypath: 'id'});
      let keyValStore = upgradeDb.createObjectStore(review_store, { keypath: 'id' });
      keyValStore.createIndex('restaurant_id', 'restaurant_id');
  }
});

let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
let networkStatus = true;


/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_URL_REVIEWS() {
    const port = 1337
    return `http://localhost:${port}/reviews/`;
  }
  
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback, id) {
    /* let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send(); 
    */
    let fetchURL = DBHelper.DATABASE_URL;

    if (!id) {
      fetchURL = DBHelper.DATABASE_URL;
    } else {
      fetchURL = DBHelper.DATABASE_URL + '/' + id;
    }

      fetch(fetchURL).then(response => {
      response.json().then(restaurants => {
      console.log("restaurants JSON: ", restaurants); // added from Project supplied webinar to troubleshoot 10th image not displaying
      callback(null, restaurants);
      });
    }).catch(err => {
    const error = (`Request failed. Returned ${err}`);
    callback(error, null);
  });
}

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        console.log(`callback type: ${typeof callback}`);
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(callback, cuisine) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(callback, neighborhood) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        //console.log(typeof callback);
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   * Change needed for Rest Server as extension is no longer supplied
   */
  static imageUrlForRestaurant(restaurant) {
    //change due to database not having photograph value for every entry
    return (`/img/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  /**
   * 
   */
  static checkConnection(){
    return (networkStatus === true) ?true :false;
  }

  static networkReconnectAddReview(){
    dbPromise.then(db => {
      return db.transaction(review_store)
      .objectStore(review_store).getAll();
    }).then(results => {
      let reviews = results.filter(result => result.offlineFlag == true);
      reviews.forEach(review => {
      delete review.offlineFlag;
        DBHelper.saveNewReview(review, (error, result) =>{
          if(error){
            console.log(`Save review error on reconnect: ${error}`);
          }
          console.log(`Review saved: ${result}`);
          return;
        });
      })
    }).catch(err => {
      console.log(err);
    })
  }

  /**
   * 
   */
  static networkReconnect(){
    DBHelper.networkReconnectAddReview();
  }

  /**
   * 
   */
  static updateConnectionStatus() {
    if(!navigator.onLine){
      networkStatus = false;
      console.log(`Connection has been lost: ${networkStatus}`);
    } else {
      networkStatus = true;
      console.log(`Connection reestablished: ${networkStatus}`);
      //check for pending updates need more code under here
      DBHelper.networkReconnect();
    }
  }

  static updateRestaurantIDB(restaurant, callback) {
    //check if offline if so add offline flag to restaurant
    const favStatus = restaurant.is_favorite;
    dbPromise.then(db => {
      return db.transaction(storename, 'readwrite')
      .objectStore(storename).put(restaurant, restaurant.id);
    }).then(data => {
      console.log(`Successfull change of favorite for ${data}`);
      DBHelper.updateRestaurantByID(data, favStatus, (error, result) => {
        if(error){
          callback(error,null);
          return;
        }
        callback(null, result);
      })
    }).catch(err => {
      console.log(`Error updating favorite for: ${err}`);
      callback(err, null);
    })
  }

  static updateRestaurantByID(id, favStatus, callback) {
    const postUrl = `${DBHelper.DATABASE_URL}/${id}/?is_favorite=${favStatus}`;
    fetch(postUrl, {method: 'post'})
    .then(response => {
      response.json().then(result => {
      console.log(`Success changing favorite on server: ${result}`);
      callback(null, result);
      })
    }).catch(err => {
      const error = `Error updating favorite status: ${err}`;
      console.log(error);
      callback(error, null);
    })
  }

  /**
   * Add new and Update old review
   */
  static addUpdateReviewIDB(review, callback) {
    dbPromise.then(db => {
      console.log('adding review to idb cache');
      return db.transaction(review_store, 'readwrite')
      .objectStore(review_store).put(review, review.id)
    }).then(result => {
      console.log(`successfully added ${result}`);
      callback(null, result);
    }).catch(err=> {
      const error = `Error adding review to idb cache: ${err}`;
      callback(error, null);
    })
  }

  /** 
   * 
   */
  static saveNewReview(review, callback){
    const reviewURL = DBHelper.DATABASE_URL_REVIEWS;
    fetch(reviewURL, {
      method: 'post',
      body: JSON.stringify(review)
    }).then(response => {
      response.json().then(results => {
        //call to function to add or update db
        DBHelper.addUpdateReviewIDB(results, (error, results) => {
          if(error){
            callback(error, null);
            return;
          }
          callback(null,results);
        });
      }).catch(err => {
        console.log(`Fetch Post Error: ${err}`);
        callback(error,null);
    })
    })
  }

  /**
   * Save Review 
   */
  static saveReview(id, name, rating, comment,callback) {
    const review = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comment,
      createdAt: Date.now()
    }
    //if connection submit to server else post in idb with flag set for offline
    //DBHelper.checkConnection();
    if(networkStatus == false){
      //add flag for offline
      const tempId = new Date().getTime();
      review.id = tempId;
      review.offlineFlag = true;
      //add review to idb
      DBHelper.addUpdateReviewIDB(review, (error, results) => {
        if(error){
          callback(error, null);
          return;
        }
        callback(null, results);
      });
      return;  
    }
    DBHelper.saveNewReview(review, (error, result) => {
      if(error){
        callback(error, null);
        return;
      }
      callback(null, result);
    });
  }
  /**
   * Fetch reviews by id for resource management
   */
  static fetchReviewByRestaurantId(id, callback){
      const reviewURL = `${DBHelper.DATABASE_URL_REVIEWS}?restaurant_id=${id}`;
      console.log(reviewURL);
      fetch(reviewURL).then(response => {
        response.json().then(reviews => {
          /*if(!reviews){
            callback(error,null);
          } else{
            //deal with reviews that are found...add to idb
            reviews.forEach(review => {
              DBHelper.addUpdateReviewIDB(review);
            });  
          } */
          callback(null, reviews);
        }).catch(err => {
          console.log(`Review request failed: Returned ${err}`);
          /* dbPromise.then(db => {
            return db.transaction(review_store).objectStore(review_store)
            .index('restaurant_id').getAll(id);
          }).then(reviews => {
            callback(null,reviews);
          }) */
        })
      });
  }
}
//add event listener for connection change from mozilla.org
connection.addEventListener('change', DBHelper.updateConnectionStatus);

