"use strict";function _typeof(obj) {if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {_typeof = function _typeof(obj) {return typeof obj;};} else {_typeof = function _typeof(obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};}return _typeof(obj);}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Common database helper functions.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */var
DBHelper = /*#__PURE__*/function () {function DBHelper() {_classCallCheck(this, DBHelper);}_createClass(DBHelper, null, [{ key: "fetchRestaurants",










    /**
                                                                                                                                                     * Fetch all restaurants.
                                                                                                                                                     */value: function fetchRestaurants(
    callback, id) {
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
      var fetchURL = DBHelper.DATABASE_URL;

      if (!id) {
        fetchURL = DBHelper.DATABASE_URL;
      } else {
        fetchURL = DBHelper.DATABASE_URL + '/' + id;
      }

      fetch(fetchURL).then(function (response) {return response.json();}).
      then(function (data) {
        console.log("restaurants JSON: ", data); // added from Project supplied webinar to troubleshoot 10th image not displaying
        callback(null, data);}).
      catch(function (err) {var error = "Request failed. Returned ".concat(err);
        callback(error, null);
      });

    }

    /**
       * Fetch a restaurant by its ID.
       */ }, { key: "fetchRestaurantById", value: function fetchRestaurantById(
    callback, id) {
      // fetch all restaurants with proper error handling.
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          console.log("callback type: ".concat(_typeof(callback)));
          callback(error, null);
        } else {
          var restaurant = restaurants.find(function (r) {return r.id == id;});
          if (restaurant) {// Got the restaurant
            callback(null, restaurant);
          } else {// Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
          }
        }
      });
    }

    /**
       * Fetch restaurants by a cuisine type with proper error handling.
       */ }, { key: "fetchRestaurantByCuisine", value: function fetchRestaurantByCuisine(
    callback, cuisine) {
      // Fetch all restaurants  with proper error handling
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          var results = restaurants.filter(function (r) {return r.cuisine_type == cuisine;});
          callback(null, results);
        }
      });
    }

    /**
       * Fetch restaurants by a neighborhood with proper error handling.
       */ }, { key: "fetchRestaurantByNeighborhood", value: function fetchRestaurantByNeighborhood(
    callback, neighborhood) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          var results = restaurants.filter(function (r) {return r.neighborhood == neighborhood;});
          callback(null, results);
        }
      });
    }

    /**
       * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
       */ }, { key: "fetchRestaurantByCuisineAndNeighborhood", value: function fetchRestaurantByCuisineAndNeighborhood(
    cuisine, neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          console.log(_typeof(callback));
          callback(error, null);
        } else {
          var results = restaurants;
          if (cuisine != 'all') {// filter by cuisine
            results = results.filter(function (r) {return r.cuisine_type == cuisine;});
          }
          if (neighborhood != 'all') {// filter by neighborhood
            results = results.filter(function (r) {return r.neighborhood == neighborhood;});
          }
          callback(null, results);
        }
      });
    }

    /**
       * Fetch all neighborhoods with proper error handling.
       */ }, { key: "fetchNeighborhoods", value: function fetchNeighborhoods(
    callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Get all neighborhoods from all restaurants
          var neighborhoods = restaurants.map(function (v, i) {return restaurants[i].neighborhood;});
          // Remove duplicates from neighborhoods
          var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {return neighborhoods.indexOf(v) == i;});
          callback(null, uniqueNeighborhoods);
        }
      });
    }

    /**
       * Fetch all cuisines with proper error handling.
       */ }, { key: "fetchCuisines", value: function fetchCuisines(
    callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Get all cuisines from all restaurants
          var cuisines = restaurants.map(function (v, i) {return restaurants[i].cuisine_type;});
          // Remove duplicates from cuisines
          var uniqueCuisines = cuisines.filter(function (v, i) {return cuisines.indexOf(v) == i;});
          callback(null, uniqueCuisines);
        }
      });
    }

    /**
       * Restaurant page URL.
       */ }, { key: "urlForRestaurant", value: function urlForRestaurant(
    restaurant) {
      return "./restaurant.html?id=".concat(restaurant.id);
    }

    /**
       * Restaurant image URL.
       * Change needed for Rest Server as extension is no longer supplied
       */ }, { key: "imageUrlForRestaurant", value: function imageUrlForRestaurant(
    restaurant) {
      //change due to database not having photograph value for every entry
      return "/img/".concat(restaurant.id, ".jpg");
    }

    /**
       * Map marker for a restaurant.
       */ }, { key: "mapMarkerForRestaurant", value: function mapMarkerForRestaurant(
    restaurant, map) {
      // https://leafletjs.com/reference-1.3.0.html#marker  
      var marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      { title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant) });

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
      } */ }, { key: "DATABASE_URL", /**
                                      * Database URL.
                                      * Change this to restaurants.json file location on your server.
                                      */get: function get() {var port = 1337; // Change this to your server port
      return "http://localhost:".concat(port, "/restaurants");} }]);return DBHelper;}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIl0sIm5hbWVzIjpbIkRCSGVscGVyIiwiY2FsbGJhY2siLCJpZCIsImZldGNoVVJMIiwiREFUQUJBU0VfVVJMIiwiZmV0Y2giLCJ0aGVuIiwicmVzcG9uc2UiLCJqc29uIiwiZGF0YSIsImNvbnNvbGUiLCJsb2ciLCJjYXRjaCIsImVyciIsImVycm9yIiwiZmV0Y2hSZXN0YXVyYW50cyIsInJlc3RhdXJhbnRzIiwicmVzdGF1cmFudCIsImZpbmQiLCJyIiwiY3Vpc2luZSIsInJlc3VsdHMiLCJmaWx0ZXIiLCJjdWlzaW5lX3R5cGUiLCJuZWlnaGJvcmhvb2QiLCJuZWlnaGJvcmhvb2RzIiwibWFwIiwidiIsImkiLCJ1bmlxdWVOZWlnaGJvcmhvb2RzIiwiaW5kZXhPZiIsImN1aXNpbmVzIiwidW5pcXVlQ3Vpc2luZXMiLCJtYXJrZXIiLCJMIiwibGF0bG5nIiwibGF0IiwibG5nIiwidGl0bGUiLCJuYW1lIiwiYWx0IiwidXJsIiwidXJsRm9yUmVzdGF1cmFudCIsImFkZFRvIiwibmV3TWFwIiwicG9ydCJdLCJtYXBwaW5ncyI6IisvQkFBQTs7O0FBR01BLFE7Ozs7Ozs7Ozs7O0FBV0o7OztBQUd3QkMsSUFBQUEsUSxFQUFVQyxFLEVBQUk7QUFDcEM7Ozs7Ozs7Ozs7Ozs7O0FBY0EsVUFBSUMsUUFBUSxHQUFHSCxRQUFRLENBQUNJLFlBQXhCOztBQUVBLFVBQUksQ0FBQ0YsRUFBTCxFQUFTO0FBQ1BDLFFBQUFBLFFBQVEsR0FBR0gsUUFBUSxDQUFDSSxZQUFwQjtBQUNELE9BRkQsTUFFTztBQUNMRCxRQUFBQSxRQUFRLEdBQUdILFFBQVEsQ0FBQ0ksWUFBVCxHQUF3QixHQUF4QixHQUE4QkYsRUFBekM7QUFDRDs7QUFFREcsTUFBQUEsS0FBSyxDQUFDRixRQUFELENBQUwsQ0FBZ0JHLElBQWhCLENBQXFCLFVBQUFDLFFBQVEsVUFBSUEsUUFBUSxDQUFDQyxJQUFULEVBQUosRUFBN0I7QUFDQ0YsTUFBQUEsSUFERCxDQUNNLFVBQUFHLElB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RDtBQUNEOzs7Ozs7Ozs7cUNBeExBOzs7NERBSTBCLENBQ3hCLElBQU1ZLElBQUksR0FBRyxJQUFiLENBRHdCLENBQ047QUFDbEIsd0NBQTJCQSxJQUEzQixrQkFDRCxDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvbW1vbiBkYXRhYmFzZSBoZWxwZXIgZnVuY3Rpb25zLlxyXG4gKi9cclxuY2xhc3MgREJIZWxwZXIge1xyXG5cclxuICAvKipcclxuICAgKiBEYXRhYmFzZSBVUkwuXHJcbiAgICogQ2hhbmdlIHRoaXMgdG8gcmVzdGF1cmFudHMuanNvbiBmaWxlIGxvY2F0aW9uIG9uIHlvdXIgc2VydmVyLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXQgREFUQUJBU0VfVVJMKCkge1xyXG4gICAgY29uc3QgcG9ydCA9IDEzMzcgLy8gQ2hhbmdlIHRoaXMgdG8geW91ciBzZXJ2ZXIgcG9ydFxyXG4gICAgcmV0dXJuIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vcmVzdGF1cmFudHNgO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggYWxsIHJlc3RhdXJhbnRzLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRzKGNhbGxiYWNrLCBpZCkge1xyXG4gICAgLyogbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgeGhyLm9wZW4oJ0dFVCcsIERCSGVscGVyLkRBVEFCQVNFX1VSTCk7XHJcbiAgICB4aHIub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7IC8vIEdvdCBhIHN1Y2Nlc3MgcmVzcG9uc2UgZnJvbSBzZXJ2ZXIhXHJcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgY29uc3QgcmVzdGF1cmFudHMgPSBqc29uLnJlc3RhdXJhbnRzO1xyXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3RhdXJhbnRzKTtcclxuICAgICAgfSBlbHNlIHsgLy8gT29wcyEuIEdvdCBhbiBlcnJvciBmcm9tIHNlcnZlci5cclxuICAgICAgICBjb25zdCBlcnJvciA9IChgUmVxdWVzdCBmYWlsZWQuIFJldHVybmVkIHN0YXR1cyBvZiAke3hoci5zdGF0dXN9YCk7XHJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgeGhyLnNlbmQoKTsgXHJcbiAgICAqL1xyXG4gICAgbGV0IGZldGNoVVJMID0gREJIZWxwZXIuREFUQUJBU0VfVVJMO1xyXG5cclxuICAgIGlmICghaWQpIHtcclxuICAgICAgZmV0Y2hVUkwgPSBEQkhlbHBlci5EQVRBQkFTRV9VUkw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmZXRjaFVSTCA9IERCSGVscGVyLkRBVEFCQVNFX1VSTCArICcvJyArIGlkO1xyXG4gICAgfVxyXG5cclxuICAgIGZldGNoKGZldGNoVVJMKS50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcclxuICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZyhcInJlc3RhdXJhbnRzIEpTT046IFwiLCBkYXRhKTsgLy8gYWRkZWQgZnJvbSBQcm9qZWN0IHN1cHBsaWVkIHdlYmluYXIgdG8gdHJvdWJsZXNob290IDEwdGggaW1hZ2Ugbm90IGRpc3BsYXlpbmdcclxuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSl9KVxyXG4gICAgLmNhdGNoKGVyciA9PiB7Y29uc3QgZXJyb3IgPSAoYFJlcXVlc3QgZmFpbGVkLiBSZXR1cm5lZCAke2Vycn1gKTtcclxuICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICB9KVxyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGEgcmVzdGF1cmFudCBieSBpdHMgSUQuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5SWQoY2FsbGJhY2ssIGlkKSB7XHJcbiAgICAvLyBmZXRjaCBhbGwgcmVzdGF1cmFudHMgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYGNhbGxiYWNrIHR5cGU6ICR7dHlwZW9mIGNhbGxiYWNrfWApO1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCByZXN0YXVyYW50ID0gcmVzdGF1cmFudHMuZmluZChyID0+IHIuaWQgPT0gaWQpO1xyXG4gICAgICAgIGlmIChyZXN0YXVyYW50KSB7IC8vIEdvdCB0aGUgcmVzdGF1cmFudFxyXG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdGF1cmFudCk7XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gUmVzdGF1cmFudCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgZGF0YWJhc2VcclxuICAgICAgICAgIGNhbGxiYWNrKCdSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0JywgbnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSB0eXBlIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmUoY2FsbGJhY2ssIGN1aXNpbmUpIHtcclxuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50cyAgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gRmlsdGVyIHJlc3RhdXJhbnRzIHRvIGhhdmUgb25seSBnaXZlbiBjdWlzaW5lIHR5cGVcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzdGF1cmFudHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5TmVpZ2hib3Job29kKGNhbGxiYWNrLCBuZWlnaGJvcmhvb2QpIHtcclxuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIG5laWdoYm9yaG9vZFxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXN0YXVyYW50cy5maWx0ZXIociA9PiByLm5laWdoYm9yaG9vZCA9PSBuZWlnaGJvcmhvb2QpO1xyXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSBhbmQgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZUFuZE5laWdoYm9yaG9vZChjdWlzaW5lLCBuZWlnaGJvcmhvb2QsIGNhbGxiYWNrKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh0eXBlb2YgY2FsbGJhY2spO1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgcmVzdWx0cyA9IHJlc3RhdXJhbnRzXHJcbiAgICAgICAgaWYgKGN1aXNpbmUgIT0gJ2FsbCcpIHsgLy8gZmlsdGVyIGJ5IGN1aXNpbmVcclxuICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihyID0+IHIuY3Vpc2luZV90eXBlID09IGN1aXNpbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobmVpZ2hib3Job29kICE9ICdhbGwnKSB7IC8vIGZpbHRlciBieSBuZWlnaGJvcmhvb2RcclxuICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihyID0+IHIubmVpZ2hib3Job29kID09IG5laWdoYm9yaG9vZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGFsbCBuZWlnaGJvcmhvb2RzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaE5laWdoYm9yaG9vZHMoY2FsbGJhY2spIHtcclxuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBHZXQgYWxsIG5laWdoYm9yaG9vZHMgZnJvbSBhbGwgcmVzdGF1cmFudHNcclxuICAgICAgICBjb25zdCBuZWlnaGJvcmhvb2RzID0gcmVzdGF1cmFudHMubWFwKCh2LCBpKSA9PiByZXN0YXVyYW50c1tpXS5uZWlnaGJvcmhvb2QpXHJcbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBuZWlnaGJvcmhvb2RzXHJcbiAgICAgICAgY29uc3QgdW5pcXVlTmVpZ2hib3Job29kcyA9IG5laWdoYm9yaG9vZHMuZmlsdGVyKCh2LCBpKSA9PiBuZWlnaGJvcmhvb2RzLmluZGV4T2YodikgPT0gaSlcclxuICAgICAgICBjYWxsYmFjayhudWxsLCB1bmlxdWVOZWlnaGJvcmhvb2RzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBhbGwgY3Vpc2luZXMgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoQ3Vpc2luZXMoY2FsbGJhY2spIHtcclxuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBHZXQgYWxsIGN1aXNpbmVzIGZyb20gYWxsIHJlc3RhdXJhbnRzXHJcbiAgICAgICAgY29uc3QgY3Vpc2luZXMgPSByZXN0YXVyYW50cy5tYXAoKHYsIGkpID0+IHJlc3RhdXJhbnRzW2ldLmN1aXNpbmVfdHlwZSlcclxuICAgICAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBmcm9tIGN1aXNpbmVzXHJcbiAgICAgICAgY29uc3QgdW5pcXVlQ3Vpc2luZXMgPSBjdWlzaW5lcy5maWx0ZXIoKHYsIGkpID0+IGN1aXNpbmVzLmluZGV4T2YodikgPT0gaSlcclxuICAgICAgICBjYWxsYmFjayhudWxsLCB1bmlxdWVDdWlzaW5lcyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdGF1cmFudCBwYWdlIFVSTC5cclxuICAgKi9cclxuICBzdGF0aWMgdXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSB7XHJcbiAgICByZXR1cm4gKGAuL3Jlc3RhdXJhbnQuaHRtbD9pZD0ke3Jlc3RhdXJhbnQuaWR9YCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0YXVyYW50IGltYWdlIFVSTC5cclxuICAgKiBDaGFuZ2UgbmVlZGVkIGZvciBSZXN0IFNlcnZlciBhcyBleHRlbnNpb24gaXMgbm8gbG9uZ2VyIHN1cHBsaWVkXHJcbiAgICovXHJcbiAgc3RhdGljIGltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSB7XHJcbiAgICAvL2NoYW5nZSBkdWUgdG8gZGF0YWJhc2Ugbm90IGhhdmluZyBwaG90b2dyYXBoIHZhbHVlIGZvciBldmVyeSBlbnRyeVxyXG4gICAgcmV0dXJuIChgL2ltZy8ke3Jlc3RhdXJhbnQuaWR9LmpwZ2ApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwIG1hcmtlciBmb3IgYSByZXN0YXVyYW50LlxyXG4gICAqL1xyXG4gICBzdGF0aWMgbWFwTWFya2VyRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBtYXApIHtcclxuICAgIC8vIGh0dHBzOi8vbGVhZmxldGpzLmNvbS9yZWZlcmVuY2UtMS4zLjAuaHRtbCNtYXJrZXIgIFxyXG4gICAgY29uc3QgbWFya2VyID0gbmV3IEwubWFya2VyKFtyZXN0YXVyYW50LmxhdGxuZy5sYXQsIHJlc3RhdXJhbnQubGF0bG5nLmxuZ10sXHJcbiAgICAgIHt0aXRsZTogcmVzdGF1cmFudC5uYW1lLFxyXG4gICAgICBhbHQ6IHJlc3RhdXJhbnQubmFtZSxcclxuICAgICAgdXJsOiBEQkhlbHBlci51cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpXHJcbiAgICAgIH0pXHJcbiAgICAgIG1hcmtlci5hZGRUbyhuZXdNYXApO1xyXG4gICAgcmV0dXJuIG1hcmtlcjtcclxuICB9IFxyXG4gIC8qIHN0YXRpYyBtYXBNYXJrZXJGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIG1hcCkge1xyXG4gICAgY29uc3QgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XHJcbiAgICAgIHBvc2l0aW9uOiByZXN0YXVyYW50LmxhdGxuZyxcclxuICAgICAgdGl0bGU6IHJlc3RhdXJhbnQubmFtZSxcclxuICAgICAgdXJsOiBEQkhlbHBlci51cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpLFxyXG4gICAgICBtYXA6IG1hcCxcclxuICAgICAgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUH1cclxuICAgICk7XHJcbiAgICByZXR1cm4gbWFya2VyO1xyXG4gIH0gKi9cclxuXHJcbn1cclxuXHJcbiJdLCJmaWxlIjoiZGJoZWxwZXIuanMifQ==

//# sourceMappingURL=dbhelper.js.map
