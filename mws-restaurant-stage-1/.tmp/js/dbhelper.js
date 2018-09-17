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
          console.log(_typeof(callback));
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
    callback, cuisine, neighborhood) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIl0sIm5hbWVzIjpbIkRCSGVscGVyIiwiY2FsbGJhY2siLCJpZCIsImZldGNoVVJMIiwiREFUQUJBU0VfVVJMIiwiZmV0Y2giLCJ0aGVuIiwicmVzcG9uc2UiLCJqc29uIiwiZGF0YSIsImNvbnNvbGUiLCJsb2ciLCJjYXRjaCIsImVyciIsImVycm9yIiwiZmV0Y2hSZXN0YXVyYW50cyIsInJlc3RhdXJhbnRzIiwicmVzdGF1cmFudCIsImZpbmQiLCJyIiwiY3Vpc2luZSIsInJlc3VsdHMiLCJmaWx0ZXIiLCJjdWlzaW5lX3R5cGUiLCJuZWlnaGJvcmhvb2QiLCJuZWlnaGJvcmhvb2RzIiwibWFwIiwidiIsImkiLCJ1bmlxdWVOZWlnaGJvcmhvb2RzIiwiaW5kZXhPZiIsImN1aXNpbmVzIiwidW5pcXVlQ3Vpc2luZXMiLCJtYXJrZXIiLCJMIiwibGF0bG5nIiwibGF0IiwibG5nIiwidGl0bGUiLCJuYW1lIiwiYWx0IiwidXJsIiwidXJsRm9yUmVzdGF1cmFudCIsImFkZFRvIiwibmV3TWFwIiwicG9ydCJdLCJtYXBwaW5ncyI6IisvQkFBQTs7O0FBR01BLFE7Ozs7Ozs7Ozs7O0FBV0o7OztBQUd3QkMsSUFBQUEsUSxFQUFVQyxFLEVBQUk7QUFDcEM7Ozs7Ozs7Ozs7Ozs7O0FBY0EsVUFBSUMsUUFBUSxHQUFHSCxRQUFRLENBQUNJLFlBQXhCOztBQUVBLFVBQUksQ0FBQ0YsRUFBTCxFQUFTO0FBQ1BDLFFBQUFBLFFBQVEsR0FBR0gsUUFBUSxDQUFDSSxZQUFwQjtBQUNELE9BRkQsTUFFTztBQUNMRCxRQUFBQSxRQUFRLEdBQUdILFFBQVEsQ0FBQ0ksWUFBVCxHQUF3QixHQUF4QixHQUE4QkYsRUFBekM7QUFDRDs7QUFFREcsTUFBQUEsS0FBSyxDQUFDRixRQUFELENBQUwsQ0FBZ0JHLElBQWhCLENBQXFCLFVBQUFDLFFBQVEsVUFBSUEsUUFBUSxDQUFDQyxJQUFULEVBQUosRUFBN0I7QUFDQ0YsTUFBQUEsSUFERCxDQUNNLFVBQUFHLElB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Q0Q7QUFDRDs7Ozs7Ozs7O3FDQXhMQTs7OzREQUkwQixDQUN4QixJQUFNWSxJQUFJLEdBQUcsSUFBYixDQUR3QixDQUNOO0FBQ2xCLHdDQUEyQkEsSUFBM0Isa0JBQ0QsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb21tb24gZGF0YWJhc2UgaGVscGVyIGZ1bmN0aW9ucy5cclxuICovXHJcbmNsYXNzIERCSGVscGVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogRGF0YWJhc2UgVVJMLlxyXG4gICAqIENoYW5nZSB0aGlzIHRvIHJlc3RhdXJhbnRzLmpzb24gZmlsZSBsb2NhdGlvbiBvbiB5b3VyIHNlcnZlci5cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0IERBVEFCQVNFX1VSTCgpIHtcclxuICAgIGNvbnN0IHBvcnQgPSAxMzM3IC8vIENoYW5nZSB0aGlzIHRvIHlvdXIgc2VydmVyIHBvcnRcclxuICAgIHJldHVybiBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L3Jlc3RhdXJhbnRzYDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGFsbCByZXN0YXVyYW50cy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50cyhjYWxsYmFjaywgaWQpIHtcclxuICAgIC8qIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIHhoci5vcGVuKCdHRVQnLCBEQkhlbHBlci5EQVRBQkFTRV9VUkwpO1xyXG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkgeyAvLyBHb3QgYSBzdWNjZXNzIHJlc3BvbnNlIGZyb20gc2VydmVyIVxyXG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgIGNvbnN0IHJlc3RhdXJhbnRzID0ganNvbi5yZXN0YXVyYW50cztcclxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50cyk7XHJcbiAgICAgIH0gZWxzZSB7IC8vIE9vcHMhLiBHb3QgYW4gZXJyb3IgZnJvbSBzZXJ2ZXIuXHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoYFJlcXVlc3QgZmFpbGVkLiBSZXR1cm5lZCBzdGF0dXMgb2YgJHt4aHIuc3RhdHVzfWApO1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHhoci5zZW5kKCk7IFxyXG4gICAgKi9cclxuICAgIGxldCBmZXRjaFVSTCA9IERCSGVscGVyLkRBVEFCQVNFX1VSTDtcclxuXHJcbiAgICBpZiAoIWlkKSB7XHJcbiAgICAgIGZldGNoVVJMID0gREJIZWxwZXIuREFUQUJBU0VfVVJMO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZmV0Y2hVUkwgPSBEQkhlbHBlci5EQVRBQkFTRV9VUkwgKyAnLycgKyBpZDtcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaChmZXRjaFVSTCkudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXHJcbiAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJyZXN0YXVyYW50cyBKU09OOiBcIiwgZGF0YSk7IC8vIGFkZGVkIGZyb20gUHJvamVjdCBzdXBwbGllZCB3ZWJpbmFyIHRvIHRyb3VibGVzaG9vdCAxMHRoIGltYWdlIG5vdCBkaXNwbGF5aW5nXHJcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpfSlcclxuICAgIC5jYXRjaChlcnIgPT4ge2NvbnN0IGVycm9yID0gKGBSZXF1ZXN0IGZhaWxlZC4gUmV0dXJuZWQgJHtlcnJ9YCk7XHJcbiAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgfSlcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBhIHJlc3RhdXJhbnQgYnkgaXRzIElELlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUlkKGNhbGxiYWNrLCBpZCkge1xyXG4gICAgLy8gZmV0Y2ggYWxsIHJlc3RhdXJhbnRzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHR5cGVvZiBjYWxsYmFjayk7XHJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHJlc3RhdXJhbnQgPSByZXN0YXVyYW50cy5maW5kKHIgPT4gci5pZCA9PSBpZCk7XHJcbiAgICAgICAgaWYgKHJlc3RhdXJhbnQpIHsgLy8gR290IHRoZSByZXN0YXVyYW50XHJcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50KTtcclxuICAgICAgICB9IGVsc2UgeyAvLyBSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0IGluIHRoZSBkYXRhYmFzZVxyXG4gICAgICAgICAgY2FsbGJhY2soJ1Jlc3RhdXJhbnQgZG9lcyBub3QgZXhpc3QnLCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBjdWlzaW5lIHR5cGUgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZShjYWxsYmFjaywgY3Vpc2luZSkge1xyXG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzICB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZ1xyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIGN1aXNpbmUgdHlwZVxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXN0YXVyYW50cy5maWx0ZXIociA9PiByLmN1aXNpbmVfdHlwZSA9PSBjdWlzaW5lKTtcclxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCByZXN0YXVyYW50cyBieSBhIG5laWdoYm9yaG9vZCB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlOZWlnaGJvcmhvb2QoY2FsbGJhY2ssIG5laWdoYm9yaG9vZCkge1xyXG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXHJcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEZpbHRlciByZXN0YXVyYW50cyB0byBoYXZlIG9ubHkgZ2l2ZW4gbmVpZ2hib3Job29kXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3RhdXJhbnRzLmZpbHRlcihyID0+IHIubmVpZ2hib3Job29kID09IG5laWdoYm9yaG9vZCk7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBjdWlzaW5lIGFuZCBhIG5laWdoYm9yaG9vZCB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlDdWlzaW5lQW5kTmVpZ2hib3Job29kKGNhbGxiYWNrLCBjdWlzaW5lLCBuZWlnaGJvcmhvb2QpIHtcclxuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHR5cGVvZiBjYWxsYmFjayk7XHJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCByZXN1bHRzID0gcmVzdGF1cmFudHNcclxuICAgICAgICBpZiAoY3Vpc2luZSAhPSAnYWxsJykgeyAvLyBmaWx0ZXIgYnkgY3Vpc2luZVxyXG4gICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5jdWlzaW5lX3R5cGUgPT0gY3Vpc2luZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuZWlnaGJvcmhvb2QgIT0gJ2FsbCcpIHsgLy8gZmlsdGVyIGJ5IG5laWdoYm9yaG9vZFxyXG4gICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5uZWlnaGJvcmhvb2QgPT0gbmVpZ2hib3Job29kKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggYWxsIG5laWdoYm9yaG9vZHMgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoTmVpZ2hib3Job29kcyhjYWxsYmFjaykge1xyXG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXHJcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEdldCBhbGwgbmVpZ2hib3Job29kcyBmcm9tIGFsbCByZXN0YXVyYW50c1xyXG4gICAgICAgIGNvbnN0IG5laWdoYm9yaG9vZHMgPSByZXN0YXVyYW50cy5tYXAoKHYsIGkpID0+IHJlc3RhdXJhbnRzW2ldLm5laWdoYm9yaG9vZClcclxuICAgICAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyBmcm9tIG5laWdoYm9yaG9vZHNcclxuICAgICAgICBjb25zdCB1bmlxdWVOZWlnaGJvcmhvb2RzID0gbmVpZ2hib3Job29kcy5maWx0ZXIoKHYsIGkpID0+IG5laWdoYm9yaG9vZHMuaW5kZXhPZih2KSA9PSBpKVxyXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHVuaXF1ZU5laWdoYm9yaG9vZHMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGFsbCBjdWlzaW5lcyB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hDdWlzaW5lcyhjYWxsYmFjaykge1xyXG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXHJcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEdldCBhbGwgY3Vpc2luZXMgZnJvbSBhbGwgcmVzdGF1cmFudHNcclxuICAgICAgICBjb25zdCBjdWlzaW5lcyA9IHJlc3RhdXJhbnRzLm1hcCgodiwgaSkgPT4gcmVzdGF1cmFudHNbaV0uY3Vpc2luZV90eXBlKVxyXG4gICAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGZyb20gY3Vpc2luZXNcclxuICAgICAgICBjb25zdCB1bmlxdWVDdWlzaW5lcyA9IGN1aXNpbmVzLmZpbHRlcigodiwgaSkgPT4gY3Vpc2luZXMuaW5kZXhPZih2KSA9PSBpKVxyXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHVuaXF1ZUN1aXNpbmVzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0YXVyYW50IHBhZ2UgVVJMLlxyXG4gICAqL1xyXG4gIHN0YXRpYyB1cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpIHtcclxuICAgIHJldHVybiAoYC4vcmVzdGF1cmFudC5odG1sP2lkPSR7cmVzdGF1cmFudC5pZH1gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RhdXJhbnQgaW1hZ2UgVVJMLlxyXG4gICAqIENoYW5nZSBuZWVkZWQgZm9yIFJlc3QgU2VydmVyIGFzIGV4dGVuc2lvbiBpcyBubyBsb25nZXIgc3VwcGxpZWRcclxuICAgKi9cclxuICBzdGF0aWMgaW1hZ2VVcmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpIHtcclxuICAgIC8vY2hhbmdlIGR1ZSB0byBkYXRhYmFzZSBub3QgaGF2aW5nIHBob3RvZ3JhcGggdmFsdWUgZm9yIGV2ZXJ5IGVudHJ5XHJcbiAgICByZXR1cm4gKGAvaW1nLyR7cmVzdGF1cmFudC5pZH0uanBnYCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXAgbWFya2VyIGZvciBhIHJlc3RhdXJhbnQuXHJcbiAgICovXHJcbiAgIHN0YXRpYyBtYXBNYXJrZXJGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQsIG1hcCkge1xyXG4gICAgLy8gaHR0cHM6Ly9sZWFmbGV0anMuY29tL3JlZmVyZW5jZS0xLjMuMC5odG1sI21hcmtlciAgXHJcbiAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5tYXJrZXIoW3Jlc3RhdXJhbnQubGF0bG5nLmxhdCwgcmVzdGF1cmFudC5sYXRsbmcubG5nXSxcclxuICAgICAge3RpdGxlOiByZXN0YXVyYW50Lm5hbWUsXHJcbiAgICAgIGFsdDogcmVzdGF1cmFudC5uYW1lLFxyXG4gICAgICB1cmw6IERCSGVscGVyLnVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudClcclxuICAgICAgfSlcclxuICAgICAgbWFya2VyLmFkZFRvKG5ld01hcCk7XHJcbiAgICByZXR1cm4gbWFya2VyO1xyXG4gIH0gXHJcbiAgLyogc3RhdGljIG1hcE1hcmtlckZvclJlc3RhdXJhbnQocmVzdGF1cmFudCwgbWFwKSB7XHJcbiAgICBjb25zdCBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcclxuICAgICAgcG9zaXRpb246IHJlc3RhdXJhbnQubGF0bG5nLFxyXG4gICAgICB0aXRsZTogcmVzdGF1cmFudC5uYW1lLFxyXG4gICAgICB1cmw6IERCSGVscGVyLnVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCksXHJcbiAgICAgIG1hcDogbWFwLFxyXG4gICAgICBhbmltYXRpb246IGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QfVxyXG4gICAgKTtcclxuICAgIHJldHVybiBtYXJrZXI7XHJcbiAgfSAqL1xyXG5cclxufVxyXG5cclxuIl0sImZpbGUiOiJkYmhlbHBlci5qcyJ9

//# sourceMappingURL=dbhelper.js.map
