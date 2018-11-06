"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,n){for(var t=0;t<n.length;t++){var o=n[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function _createClass(e,n,t){return n&&_defineProperties(e.prototype,n),t&&_defineProperties(e,t),e}var database="restaurant-db",review_store="reviews",storename="restaurants",dbPromise=idb.open(database,1,function(e){switch(e.oldVersion){case 0:e.createObjectStore(storename,{keypath:"id"});var n=e.createObjectStore(review_store,{keypath:"id"});n.createIndex("restaurant_id","restaurant_id")}}),connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection,networkStatus=!0,DBHelper=function(){function e(){_classCallCheck(this,e)}return _createClass(e,null,[{key:"fetchRestaurants",value:function(n,t){var o=e.DATABASE_URL;o=t?e.DATABASE_URL+"/"+t:e.DATABASE_URL,fetch(o).then(function(e){e.json().then(function(e){console.log("restaurants JSON: ",e),n(null,e)})})["catch"](function(e){var t="Request failed. Returned ".concat(e);n(t,null)})}},{key:"fetchRestaurantById",value:function(n,t){e.fetchRestaurants(function(e,o){if(e)console.log("callback type: ".concat(_typeof(t))),t(e,null);else{var r=o.find(function(e){return e.id==n});r?t(null,r):t("Restaurant does not exist",null)}})}},{key:"fetchRestaurantByCuisine",value:function(n,t){e.fetchRestaurants(function(e,o){if(e)n(e,null);else{var r=o.filter(function(e){return e.cuisine_type==t});n(null,r)}})}},{key:"fetchRestaurantByNeighborhood",value:function(n,t){e.fetchRestaurants(function(e,o){if(e)n(e,null);else{var r=o.filter(function(e){return e.neighborhood==t});n(null,r)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(n,t,o){e.fetchRestaurants(function(e,r){if(e)o(e,null);else{var a=r;"all"!=n&&(a=a.filter(function(e){return e.cuisine_type==n})),"all"!=t&&(a=a.filter(function(e){return e.neighborhood==t})),o(null,a)}})}},{key:"fetchNeighborhoods",value:function(n){e.fetchRestaurants(function(e,t){if(e)n(e,null);else{var o=t.map(function(e,n){return t[n].neighborhood}),r=o.filter(function(e,n){return o.indexOf(e)==n});n(null,r)}})}},{key:"fetchCuisines",value:function(n){e.fetchRestaurants(function(e,t){if(e)n(e,null);else{var o=t.map(function(e,n){return t[n].cuisine_type}),r=o.filter(function(e,n){return o.indexOf(e)==n});n(null,r)}})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id=".concat(e.id)}},{key:"imageUrlForRestaurant",value:function(e){return"/img/".concat(e.id,".jpg")}},{key:"mapMarkerForRestaurant",value:function(n,t){var o=new L.marker([n.latlng.lat,n.latlng.lng],{title:n.name,alt:n.name,url:e.urlForRestaurant(n)});return o.addTo(newMap),o}},{key:"checkConnection",value:function(){return networkStatus===!0}},{key:"networkReconnectAddReview",value:function(){dbPromise.then(function(e){return e.transaction(review_store).objectStore(review_store).getAll()}).then(function(n){var t=n.filter(function(e){return 1==e.offlineFlag});t.forEach(function(n){delete n.offlineFlag,e.saveNewReview(n,function(e,n){e&&console.log("Save review error on reconnect: ".concat(e)),console.log("Review saved: ".concat(n))})})})["catch"](function(e){console.log(e)})}},{key:"networkReconnect",value:function(){e.networkReconnectAddReview()}},{key:"updateConnectionStatus",value:function(){navigator.onLine?(networkStatus=!0,console.log("Connection reestablished: ".concat(networkStatus)),e.networkReconnect()):(networkStatus=!1,console.log("Connection has been lost: ".concat(networkStatus)))}},{key:"addUpdateReviewIDB",value:function(e,n){dbPromise.then(function(n){return console.log("adding review to idb cache"),n.transaction(review_store,"readwrite").objectStore(review_store).put(e,e.id)}).then(function(e){console.log("successfully added ".concat(e)),n(null,e)})["catch"](function(e){var t="Error adding review to idb cache: ".concat(e);n(t,null)})}},{key:"saveNewReview",value:function(n,t){var o=e.DATABASE_URL_REVIEWS;fetch(o,{method:"post",body:JSON.stringify(n)}).then(function(n){n.json().then(function(n){e.addUpdateReviewIDB(n,function(e,n){return e?void t(e,null):void t(null,n)})})["catch"](function(e){console.log("Fetch Post Error: ".concat(e)),t(error,null)})})}},{key:"saveReview",value:function(n,t,o,r,a){var c={restaurant_id:n,name:t,rating:o,comments:r,createdAt:Date.now()};if(0==networkStatus){var i=(new Date).getTime();return c.id=i,c.offlineFlag=!0,void e.addUpdateReviewIDB(c,function(e,n){return e?void a(e,null):void a(null,n)})}e.saveNewReview(c,function(e,n){return e?void a(e,null):void a(null,n)})}},{key:"fetchReviewByRestaurantId",value:function(n,t){var o="".concat(e.DATABASE_URL_REVIEWS,"?restaurant_id=").concat(n);console.log(o),fetch(o).then(function(e){e.json().then(function(e){t(null,e)})["catch"](function(e){console.log("Review request failed: Returned ".concat(e))})})}},{key:"DATABASE_URL",get:function(){var e=1337;return"http://localhost:".concat(e,"/restaurants")}},{key:"DATABASE_URL_REVIEWS",get:function(){var e=1337;return"http://localhost:".concat(e,"/reviews/")}}]),e}();connection.addEventListener("change",DBHelper.updateConnectionStatus);
//# sourceMappingURL=dbhelper.js.map
