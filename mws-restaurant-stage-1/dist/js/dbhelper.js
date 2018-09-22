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

      fetch(fetchURL).then(function (response) {
        response.clone().json().then(function (restaurants) {
          console.log("restaurants JSON: ", restaurants); // added from Project supplied webinar to troubleshoot 10th image not displaying
          callback(null, restaurants);
        });
      }).catch(function (err) {
        var error = "Request failed. Returned ".concat(err);
        callback(error, null);
      });
    }

    /**
       * Fetch a restaurant by its ID.
       */ }, { key: "fetchRestaurantById", value: function fetchRestaurantById(
    id, callback) {
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
          //console.log(typeof callback);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIl0sIm5hbWVzIjpbIkRCSGVscGVyIiwiY2FsbGJhY2siLCJpZCIsImZldGNoVVJMIiwiREFUQUJBU0VfVVJMIiwiZmV0Y2giLCJ0aGVuIiwicmVzcG9uc2UiLCJjbG9uZSIsImpzb24iLCJyZXN0YXVyYW50cyIsImNvbnNvbGUiLCJsb2ciLCJjYXRjaCIsImVyciIsImVycm9yIiwiZmV0Y2hSZXN0YXVyYW50cyIsInJlc3RhdXJhbnQiLCJmaW5kIiwiciIsImN1aXNpbmUiLCJyZXN1bHRzIiwiZmlsdGVyIiwiY3Vpc2luZV90eXBlIiwibmVpZ2hib3Job29kIiwibmVpZ2hib3Job29kcyIsIm1hcCIsInYiLCJpIiwidW5pcXVlTmVpZ2hib3Job29kcyIsImluZGV4T2YiLCJjdWlzaW5lcyIsInVuaXF1ZUN1aXNpbmVzIiwibWFya2VyIiwiTCIsImxhdGxuZyIsImxhdCIsImxuZyIsInRpdGxlIiwibmFtZSIsImFsdCIsInVybCIsInVybEZvclJlc3RhdXJhbnQiLCJhZGRUbyIsIm5ld01hcCIsInBvcnQiXSwibWFwcGluZ3MiOiIrL0JBQUE7OztBQUdNQSxROzs7Ozs7Ozs7OztBQVdKOzs7QUFHd0JDLElBQUFBLFEsRUFBVUMsRSxFQUFJO0FBQ3BDOzs7Ozs7Ozs7Ozs7OztBQWNBLFVBQUlDLFFBQVEsR0FBR0gsUUFBUSxDQUFDSSxZQUF4Qjs7QUFFQSxVQUFJLENBQUNGLEVBQUwsRUFBUztBQUNQQyxRQUFBQSxRQUFRLEdBQUdILFFBQVEsQ0FBQ0ksWUFBcEI7QUFDRCxPQUZELE1BRU87QUFDTEQsUUFBQUEsUUFBUSxHQUFHSCxRQUFRLENBQUNJLFlBQVQsR0FBd0IsR0FBeEIsR0FBOEJGLEVBQXpDO0FBQ0Q7O0FBRUNHLE1BQUFBLEtBQUssQ0FBQ0YsUUFBRCxDQUFMLENBQWdCRyxJQUFoQixDQUFxQixVQUFBQyxRQUFRLEVBQUk7QUFDakNBLFFBQUFBLFFBQVEsQ0FBQ0MsS0FBVCxHQUFpQkMsSUFBakIsR0FBd0JILElBQXhCLENB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Ozs7Ozs7O3FDQXpMQTs7OzREQUkwQixDQUN4QixJQUFNWSxJQUFJLEdBQUcsSUFBYixDQUR3QixDQUNOO0FBQ2xCLHdDQUEyQkEsSUFBM0Isa0JBQ0QsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29tbW9uIGRhdGFiYXNlIGhlbHBlciBmdW5jdGlvbnMuXG4gKi9cbmNsYXNzIERCSGVscGVyIHtcblxuICAvKipcbiAgICogRGF0YWJhc2UgVVJMLlxuICAgKiBDaGFuZ2UgdGhpcyB0byByZXN0YXVyYW50cy5qc29uIGZpbGUgbG9jYXRpb24gb24geW91ciBzZXJ2ZXIuXG4gICAqL1xuICBzdGF0aWMgZ2V0IERBVEFCQVNFX1VSTCgpIHtcbiAgICBjb25zdCBwb3J0ID0gMTMzNyAvLyBDaGFuZ2UgdGhpcyB0byB5b3VyIHNlcnZlciBwb3J0XG4gICAgcmV0dXJuIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vcmVzdGF1cmFudHNgO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGFsbCByZXN0YXVyYW50cy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRzKGNhbGxiYWNrLCBpZCkge1xuICAgIC8qIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgREJIZWxwZXIuREFUQUJBU0VfVVJMKTtcbiAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkgeyAvLyBHb3QgYSBzdWNjZXNzIHJlc3BvbnNlIGZyb20gc2VydmVyIVxuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgY29uc3QgcmVzdGF1cmFudHMgPSBqc29uLnJlc3RhdXJhbnRzO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50cyk7XG4gICAgICB9IGVsc2UgeyAvLyBPb3BzIS4gR290IGFuIGVycm9yIGZyb20gc2VydmVyLlxuICAgICAgICBjb25zdCBlcnJvciA9IChgUmVxdWVzdCBmYWlsZWQuIFJldHVybmVkIHN0YXR1cyBvZiAke3hoci5zdGF0dXN9YCk7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHhoci5zZW5kKCk7IFxuICAgICovXG4gICAgbGV0IGZldGNoVVJMID0gREJIZWxwZXIuREFUQUJBU0VfVVJMO1xuXG4gICAgaWYgKCFpZCkge1xuICAgICAgZmV0Y2hVUkwgPSBEQkhlbHBlci5EQVRBQkFTRV9VUkw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZldGNoVVJMID0gREJIZWxwZXIuREFUQUJBU0VfVVJMICsgJy8nICsgaWQ7XG4gICAgfVxuXG4gICAgICBmZXRjaChmZXRjaFVSTCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICByZXNwb25zZS5jbG9uZSgpLmpzb24oKS50aGVuKHJlc3RhdXJhbnRzID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwicmVzdGF1cmFudHMgSlNPTjogXCIsIHJlc3RhdXJhbnRzKTsgLy8gYWRkZWQgZnJvbSBQcm9qZWN0IHN1cHBsaWVkIHdlYmluYXIgdG8gdHJvdWJsZXNob290IDEwdGggaW1hZ2Ugbm90IGRpc3BsYXlpbmdcbiAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3RhdXJhbnRzKTtcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgY29uc3QgZXJyb3IgPSAoYFJlcXVlc3QgZmFpbGVkLiBSZXR1cm5lZCAke2Vycn1gKTtcbiAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gIH0pO1xufVxuXG4gIC8qKlxuICAgKiBGZXRjaCBhIHJlc3RhdXJhbnQgYnkgaXRzIElELlxuICAgKi9cbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5SWQoaWQsIGNhbGxiYWNrKSB7XG4gICAgLy8gZmV0Y2ggYWxsIHJlc3RhdXJhbnRzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBjYWxsYmFjayB0eXBlOiAke3R5cGVvZiBjYWxsYmFja31gKTtcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVzdGF1cmFudCA9IHJlc3RhdXJhbnRzLmZpbmQociA9PiByLmlkID09IGlkKTtcbiAgICAgICAgaWYgKHJlc3RhdXJhbnQpIHsgLy8gR290IHRoZSByZXN0YXVyYW50XG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdGF1cmFudCk7XG4gICAgICAgIH0gZWxzZSB7IC8vIFJlc3RhdXJhbnQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGRhdGFiYXNlXG4gICAgICAgICAgY2FsbGJhY2soJ1Jlc3RhdXJhbnQgZG9lcyBub3QgZXhpc3QnLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSB0eXBlIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxuICAgKi9cbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZShjYWxsYmFjaywgY3Vpc2luZSkge1xuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50cyAgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmdcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIGN1aXNpbmUgdHlwZVxuICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzdGF1cmFudHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgbmVpZ2hib3Job29kIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxuICAgKi9cbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5TmVpZ2hib3Job29kKGNhbGxiYWNrLCBuZWlnaGJvcmhvb2QpIHtcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIG5laWdoYm9yaG9vZFxuICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzdGF1cmFudHMuZmlsdGVyKHIgPT4gci5uZWlnaGJvcmhvb2QgPT0gbmVpZ2hib3Job29kKTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBjdWlzaW5lIGFuZCBhIG5laWdoYm9yaG9vZCB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmVBbmROZWlnaGJvcmhvb2QoY3Vpc2luZSwgbmVpZ2hib3Job29kLCBjYWxsYmFjaykge1xuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2codHlwZW9mIGNhbGxiYWNrKTtcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHJlc3VsdHMgPSByZXN0YXVyYW50c1xuICAgICAgICBpZiAoY3Vpc2luZSAhPSAnYWxsJykgeyAvLyBmaWx0ZXIgYnkgY3Vpc2luZVxuICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihyID0+IHIuY3Vpc2luZV90eXBlID09IGN1aXNpbmUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZWlnaGJvcmhvb2QgIT0gJ2FsbCcpIHsgLy8gZmlsdGVyIGJ5IG5laWdoYm9yaG9vZFxuICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihyID0+IHIubmVpZ2hib3Job29kID09IG5laWdoYm9yaG9vZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggYWxsIG5laWdoYm9yaG9vZHMgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hOZWlnaGJvcmhvb2RzKGNhbGxiYWNrKSB7XG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR2V0IGFsbCBuZWlnaGJvcmhvb2RzIGZyb20gYWxsIHJlc3RhdXJhbnRzXG4gICAgICAgIGNvbnN0IG5laWdoYm9yaG9vZHMgPSByZXN0YXVyYW50cy5tYXAoKHYsIGkpID0+IHJlc3RhdXJhbnRzW2ldLm5laWdoYm9yaG9vZClcbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBuZWlnaGJvcmhvb2RzXG4gICAgICAgIGNvbnN0IHVuaXF1ZU5laWdoYm9yaG9vZHMgPSBuZWlnaGJvcmhvb2RzLmZpbHRlcigodiwgaSkgPT4gbmVpZ2hib3Job29kcy5pbmRleE9mKHYpID09IGkpXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHVuaXF1ZU5laWdoYm9yaG9vZHMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGFsbCBjdWlzaW5lcyB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaEN1aXNpbmVzKGNhbGxiYWNrKSB7XG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR2V0IGFsbCBjdWlzaW5lcyBmcm9tIGFsbCByZXN0YXVyYW50c1xuICAgICAgICBjb25zdCBjdWlzaW5lcyA9IHJlc3RhdXJhbnRzLm1hcCgodiwgaSkgPT4gcmVzdGF1cmFudHNbaV0uY3Vpc2luZV90eXBlKVxuICAgICAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBmcm9tIGN1aXNpbmVzXG4gICAgICAgIGNvbnN0IHVuaXF1ZUN1aXNpbmVzID0gY3Vpc2luZXMuZmlsdGVyKCh2LCBpKSA9PiBjdWlzaW5lcy5pbmRleE9mKHYpID09IGkpXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHVuaXF1ZUN1aXNpbmVzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0YXVyYW50IHBhZ2UgVVJMLlxuICAgKi9cbiAgc3RhdGljIHVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkge1xuICAgIHJldHVybiAoYC4vcmVzdGF1cmFudC5odG1sP2lkPSR7cmVzdGF1cmFudC5pZH1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0YXVyYW50IGltYWdlIFVSTC5cbiAgICogQ2hhbmdlIG5lZWRlZCBmb3IgUmVzdCBTZXJ2ZXIgYXMgZXh0ZW5zaW9uIGlzIG5vIGxvbmdlciBzdXBwbGllZFxuICAgKi9cbiAgc3RhdGljIGltYWdlVXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSB7XG4gICAgLy9jaGFuZ2UgZHVlIHRvIGRhdGFiYXNlIG5vdCBoYXZpbmcgcGhvdG9ncmFwaCB2YWx1ZSBmb3IgZXZlcnkgZW50cnlcbiAgICByZXR1cm4gKGAvaW1nLyR7cmVzdGF1cmFudC5pZH0uanBnYCk7XG4gIH1cblxuICAvKipcbiAgICogTWFwIG1hcmtlciBmb3IgYSByZXN0YXVyYW50LlxuICAgKi9cbiAgIHN0YXRpYyBtYXBNYXJrZXJGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIG1hcCkge1xuICAgIC8vIGh0dHBzOi8vbGVhZmxldGpzLmNvbS9yZWZlcmVuY2UtMS4zLjAuaHRtbCNtYXJrZXIgIFxuICAgIGNvbnN0IG1hcmtlciA9IG5ldyBMLm1hcmtlcihbcmVzdGF1cmFudC5sYXRsbmcubGF0LCByZXN0YXVyYW50LmxhdGxuZy5sbmddLFxuICAgICAge3RpdGxlOiByZXN0YXVyYW50Lm5hbWUsXG4gICAgICBhbHQ6IHJlc3RhdXJhbnQubmFtZSxcbiAgICAgIHVybDogREJIZWxwZXIudXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KVxuICAgICAgfSlcbiAgICAgIG1hcmtlci5hZGRUbyhuZXdNYXApO1xuICAgIHJldHVybiBtYXJrZXI7XG4gIH0gXG4gIC8qIHN0YXRpYyBtYXBNYXJrZXJGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIG1hcCkge1xuICAgIGNvbnN0IG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgcG9zaXRpb246IHJlc3RhdXJhbnQubGF0bG5nLFxuICAgICAgdGl0bGU6IHJlc3RhdXJhbnQubmFtZSxcbiAgICAgIHVybDogREJIZWxwZXIudXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSxcbiAgICAgIG1hcDogbWFwLFxuICAgICAgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUH1cbiAgICApO1xuICAgIHJldHVybiBtYXJrZXI7XG4gIH0gKi9cblxufVxuXG4iXSwiZmlsZSI6ImRiaGVscGVyLmpzIn0=

//# sourceMappingURL=dbhelper.js.map
