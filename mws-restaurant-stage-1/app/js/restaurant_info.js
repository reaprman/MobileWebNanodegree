let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
const initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    const error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  var img = DBHelper.imageUrlForRestaurant(restaurant);
  var imgArr = img.split('.')
  var img1 = imgArr[0] + '-400_1x.' + imgArr[1];
  var img2 = imgArr[0] + '-800_2x.' + imgArr[1];
  var img3 = imgArr[0] + '-1600.' + imgArr[1];
  image.className = 'restaurant-img';
  image.src = img1;
  image.srcset = `${img3} 1600w, ${img2} 800w, ${img1} 400w`;
  image.sizes = '(max-width: 400px) 400px, (max-width: 800px) 800px, (max-width: 1200px) 1600px';
  image.alt = restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchReviewByRestaurantId(restaurant.id, (error, reviews) => {
    fillReviewsHTML(error, reviews);
  })
  
  // create review modal
  fillReviewModal();
  
}
/**
 * Function to toggle display of modal window
 */
function modalToggle(){
  const modal = document.getElementById('modal');
    modal.classList.toggle('show-modal');
}
/**
 * Create Modal to submit new review
 */
const fillReviewModal = () => {

  const rating = document.getElementById('rvw-rate');
  //loop through and create ratings
  const rates = [1,2,3,4,5];
  rates.forEach(rate =>{
    const option = document.createElement('option');
    option.value = rate;
    option.innerText = rate.toString();
    rating.append(option);
  });

  const close = document.getElementsByClassName('close-btn')[0];
  close.addEventListener("click", modalToggle);

  window.addEventListener("click", function(event){
    if(event.target.id == "modal"){
      modalToggle();
    }
  })

  const submit = document.getElementsByClassName('submit-btn')[0];
  submit.addEventListener('click',function(){
    const name = document.getElementsByClassName('rvw-reviewer')[0].value;
    const rating = document.getElementsByClassName('rvw-rate')[0].value;
    const comment = document.getElementsByClassName('rvw-comment')[0].value;

    DBHelper.saveReview(self.restaurant.id, name, rating, comment, (error, result) => {
      if(error){
        console.log(`Error saving review: ${error}`); 
      }
      window.location.href=`/restaurant.html?id=${self.restaurant.id}`;
    });
  });
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (error, reviews) => {
  if(error) {
    console.log(`Error displaying reviews: ${error}`);
  }
  self.restaurant.reviews = reviews;

  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  
  const addReviewLink = document.createElement("a");
  addReviewLink.innerHTML = 'Add Review';
  addReviewLink.onclick =  modalToggle;
  title.appendChild(addReviewLink);
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  //need change for date from review server
  date.innerHTML = new Date(review.createdAt).toDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  if(!review.comments){
    comments.innerHTML = review.comment;
  }else{
    comments.innerHTML = review.comments;
  }
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}