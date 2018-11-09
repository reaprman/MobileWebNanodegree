let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
const initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoidGhlZ3JlYXRkZWJhdGUiLCJhIjoiY2pqeHhjY2V4YWh4ZDNxbGZtMXAxdndmdSJ9.buoZhVfjmQ4MLiAk0B4vaA',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  //changes for img section inspired by Project 1 MWS
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  const img = DBHelper.imageUrlForRestaurant(restaurant);
  var imgArr = img.split('.')
  var img2x = imgArr[0] + '-800_2x.' + imgArr[1];
  var img1x = imgArr[0] + '-400_1x.' + imgArr[1];
  image.src = img1x;
  image.srcset = `${img2x} 2x, ${img1x} 1x`
  image.alt = restaurant.name;
  li.append(image);

  const restaurantHeader = document.createElement('div');
  restaurantHeader.className = 'rest-header';

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  restaurantHeader.append(name);

  const isFavorite = (restaurant["is_favorite"] && restaurant["is_favorite"].toString() === "true") ? true : false;
  const favorite = document.createElement('button');
  favorite.style.background = isFavorite ? `url("/img/like.svg") no-repeat`
    : `url("/img/not-like.svg") no-repeat`;
  favorite.id = `fav-icon-${restaurant.id}`;
  favorite.onclick = event => handleFavClick(restaurant.id, !isFavorite);
  restaurantHeader.append(favorite);
  li.append(restaurantHeader);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('button');
  more.className = 'submit-btn'
  more.innerHTML = 'Restaurant Details';
  more.onclick = function() {
    window.location.href = DBHelper.urlForRestaurant(restaurant);
  };
  //more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

const handleFavClick = (id, favStatus) => {
  const fav = document.getElementById(`fav-icon-${id}`);
  console.log(`onclick info: ${self.restaurants[id]}`);
  let restaurant = self.restaurants[id-1];
  restaurant["is_favorite"] = favStatus;
  if(!favStatus) {
    fav.setAttribute('aria-label', `${restaurant.name} not favorite`);
    fav.style.background = `url(/img/not-like.svg) no-repeat`;
  } else {
    fav.setAttribute('aria-label', `${restaurant.name} favorite`);
    fav.style.background = `url(/img/like.svg) no-repeat`;
  }
  DBHelper.updateRestaurantIDB(restaurant, (error, result) => {
    if(error){
      console.log(`Error updating favorite status for ${restaurant.name}: ${error}`);
    }
    console.log(result)
  });
  fav.onclick = event => handleFavClick(id, !favStatus);
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
}

/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

