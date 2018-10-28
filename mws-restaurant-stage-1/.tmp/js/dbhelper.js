"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,n){for(var t=0;t<n.length;t++){var o=n[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function _createClass(e,n,t){return n&&_defineProperties(e.prototype,n),t&&_defineProperties(e,t),e}var review_database="review-db",dbReviews=idb.open(review_database,1,function(e){switch(e.oldVersion){case 0:var n=e.createObjectStore("reviews",{keypath:""});n.createIndex("restaurant_id","restaurant_id")}}),connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection,type=connection.effectiveType,networkStatus=!0,DBHelper=function(){function e(){_classCallCheck(this,e)}return _createClass(e,null,[{key:"fetchRestaurants",value:function(n,t){var o=e.DATABASE_URL;o=t?e.DATABASE_URL+"/"+t:e.DATABASE_URL,fetch(o).then(function(e){e.json().then(function(e){console.log("restaurants JSON: ",e),n(null,e)})})["catch"](function(e){var t="Request failed. Returned ".concat(e);n(t,null)})}},{key:"fetchRestaurantById",value:function(n,t){e.fetchRestaurants(function(e,o){if(e)console.log("callback type: ".concat(_typeof(t))),t(e,null);else{var a=o.find(function(e){return e.id==n});a?t(null,a):t("Restaurant does not exist",null)}})}},{key:"fetchRestaurantByCuisine",value:function(n,t){e.fetchRestaurants(function(e,o){if(e)n(e,null);else{var a=o.filter(function(e){return e.cuisine_type==t});n(null,a)}})}},{key:"fetchRestaurantByNeighborhood",value:function(n,t){e.fetchRestaurants(function(e,o){if(e)n(e,null);else{var a=o.filter(function(e){return e.neighborhood==t});n(null,a)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(n,t,o){e.fetchRestaurants(function(e,a){if(e)o(e,null);else{var r=a;"all"!=n&&(r=r.filter(function(e){return e.cuisine_type==n})),"all"!=t&&(r=r.filter(function(e){return e.neighborhood==t})),o(null,r)}})}},{key:"fetchNeighborhoods",value:function(n){e.fetchRestaurants(function(e,t){if(e)n(e,null);else{var o=t.map(function(e,n){return t[n].neighborhood}),a=o.filter(function(e,n){return o.indexOf(e)==n});n(null,a)}})}},{key:"fetchCuisines",value:function(n){e.fetchRestaurants(function(e,t){if(e)n(e,null);else{var o=t.map(function(e,n){return t[n].cuisine_type}),a=o.filter(function(e,n){return o.indexOf(e)==n});n(null,a)}})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id=".concat(e.id)}},{key:"imageUrlForRestaurant",value:function(e){return"/img/".concat(e.id,".jpg")}},{key:"mapMarkerForRestaurant",value:function(n,t){var o=new L.marker([n.latlng.lat,n.latlng.lng],{title:n.name,alt:n.name,url:e.urlForRestaurant(n)});return o.addTo(newMap),o}},{key:"checkConnection",value:function(){return networkStatus===!0}},{key:"updateConnectionStatus",value:function(){"none"==type&&"none"==connection.effectiveType?(console.log("Connection has been lost"),networkStatus=!1):(console.log("Connection reestablished"),networkStatus=!0),console.log("Connection type changed from "+type+" to "+connection.effectiveType),type=connection.effectiveType}},{key:"addUpdateReviewIDB",value:function(e){dbReviews.then(function(e){return e.transaction(review_database,"readwrite").objectStore(review_database).put()})}},{key:"saveReview",value:function(n,t,o,a,r){var i=e.DATABASE_URL_REVIEWS,u={restaurant_id:n,name:t,rating:o,comments:a,createdAt:Date.now()};if(networkStatus===!1){var c=(new Date).getTime();u.id=c,u.offlineFlag=!0}fetch(i,{method:"post",body:JSON.stringify(u)}).then(function(e){e.json().then(function(e){r(null,e)})})["catch"](function(e){var n="Submission to server failed: ".concat(e);r(n,null)})}},{key:"fetchReviewByRestaurantId",value:function(n,t){var o="".concat(e.DATABASE_URL_REVIEWS,"?restaurant_id=").concat(n);console.log(o),fetch(o).then(function(e){e.json().then(function(e){e||t(error,null),t(null,e)})})["catch"](function(e){t("Review request failed: Returned ".concat(e),null)})}},{key:"DATABASE_URL",get:function(){var e=1337;return"http://localhost:".concat(e,"/restaurants")}},{key:"DATABASE_URL_REVIEWS",get:function(){var e=1337;return"http://localhost:".concat(e,"/reviews/")}}]),e}();
//# sourceMappingURL=dbhelper.js.map
