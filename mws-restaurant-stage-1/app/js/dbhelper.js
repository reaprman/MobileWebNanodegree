/* 
import idb from 'idb'
const review_database = 'review-db';
const dbReviews = idb.open(review_database, 1, upgradeDb => {
  switch (upgradeDb.oldVersion) {
    case 0:
      let keyValStore = upgradeDb.createObjectStore('reviews', {keypath: ''});
      keyValStore.createIndex('restaurant_id', 'restaurant_id');
  }
}); */

let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
let type = connection.type;
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

  /**
   * 
   */
  static updateConnectionStatus() {
    if((type == 'none') && (connection.type == ' none')){
      console.log("Connection has been lost");
      networkStatus = false;
    } else {
      console.log("Connection reestablished");
      networkStatus = true;
      //check for pending updates need more code under here
    }
    console.log("Connection type changed from " + type + " to " + connection.type);
    type = connection.type;
  }

  /**
   * Add new and Update old review
   */
  static addUpdateReviewIDB(review) {

  }

  /**
   * Save Review 
   */
  static saveReview(id, name, rating, comment,callback) {
    const reviewURL = DBHelper.DATABASE_URL_REVIEWS;
    const review = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comment,
      createdAt: Date.now()
    }
    //if connection submit to server else post in idb with flag set for offline
    //DBHelper.checkConnection();
    if(networkStatus === false){
      //add flag for offline
      const tempId = new Date().getTime();
      review.id = tempId;
      review.offlineFlag = true;
      //add review to idb
      //DBHelper.addUpdateReviewIDB(review);
      
    }
    fetch(reviewURL, {
      method: 'post',
      body: JSON.stringify(review)
    }).then(response => {
      response.json().then(data => {
        //call to function to add or update db
        callback(null,data);
      });
    }).catch(err => {
      const error = `Submission to server failed: ${err}`;
      callback(error,null);
    })
  }
  /**
   * Fetch reviews by id for resource management
   */
  static fetchReviewByRestaurantId(id, callback){
      const reviewURL = `${DBHelper.DATABASE_URL_REVIEWS}?restaurant_id=${id}`;
      console.log(reviewURL);
      fetch(reviewURL).then(response => {
        response.json().then(reviews => {
          if(!reviews){
            callback(error,null);
          }/* else{
            //deal with reviews that are found...add to idb
            reviews.forEach(review => {
              DBHelper.addUpdateReviewIDB(review);
            })
          } */
          callback(null, reviews);
        });
      }).catch(err => {
        callback(`Review request failed: Returned ${err}`,null);
        //need logic to fetch from idb on error and send data back with callback
      });
  }
}
//add event listener for connection change from mozilla.org
//connection.addEventListener('change', DBHelper.updateConnectionStatus); 

