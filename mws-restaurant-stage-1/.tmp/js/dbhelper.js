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
      console.log("FetchURL is: ".concat(fetchURL));

      fetch(fetchURL).then(function (response) {
        response.json().then(function (restaurants) {
          console.log("restaurants JSON: ", restaurants); // added from Project supplied webinar to troubleshoot 10th image not displaying
          callback(null, restaurants);
        });
      }).
      catch(function (err) {var error = "Request failed. Returned ".concat(err);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIl0sIm5hbWVzIjpbIkRCSGVscGVyIiwiY2FsbGJhY2siLCJpZCIsImZldGNoVVJMIiwiREFUQUJBU0VfVVJMIiwiY29uc29sZSIsImxvZyIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwianNvbiIsInJlc3RhdXJhbnRzIiwiY2F0Y2giLCJlcnIiLCJlcnJvciIsImZldGNoUmVzdGF1cmFudHMiLCJyZXN0YXVyYW50IiwiZmluZCIsInIiLCJjdWlzaW5lIiwicmVzdWx0cyIsImZpbHRlciIsImN1aXNpbmVfdHlwZSIsIm5laWdoYm9yaG9vZCIsIm5laWdoYm9yaG9vZHMiLCJtYXAiLCJ2IiwiaSIsInVuaXF1ZU5laWdoYm9yaG9vZHMiLCJpbmRleE9mIiwiY3Vpc2luZXMiLCJ1bmlxdWVDdWlzaW5lcyIsIm1hcmtlciIsIkwiLCJsYXRsbmciLCJsYXQiLCJsbmciLCJ0aXRsZSIsIm5hbWUiLCJhbHQiLCJ1cmwiLCJ1cmxGb3JSZXN0YXVyYW50IiwiYWRkVG8iLCJuZXdNYXAiLCJwb3J0Il0sIm1hcHBpbmdzIjoiKy9CQUFBOzs7QUFHTUEsUTs7Ozs7Ozs7Ozs7QUFXSjs7O0FBR3dCQyxJQUFBQSxRLEVBQVVDLEUsRUFBSTtBQUNwQzs7Ozs7Ozs7Ozs7Ozs7QUFjQSxVQUFJQyxRQUFRLEdBQUdILFFBQVEsQ0FBQ0ksWUFBeEI7O0FBRUEsVUFBSSxDQUFDRixFQUFMLEVBQVM7QUFDUEMsUUFBQUEsUUFBUSxHQUFHSCxRQUFRLENBQUNJLFlBQXBCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xELFFBQUFBLFFBQVEsR0FBR0gsUUFBUSxDQUFDSSxZQUFULEdBQXdCLEdBQXhCLEdBQThCRixFQUF6QztBQUNEO0FBQ0RHLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUix3QkFBNEJILFFBQTVCOztBQUVBSSxNQUFBQSxLQUFLLENBQUNKLFFBQUQsQ0FBTCxDQUFnQkssSUFBaEIsQ0FBcUIsVUFBQUMsUUFBUSxFQUFJO0FBQy9CQSxRQUFBQSxRQUFRLENBQUND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QUFQO0FBQ0Q7QUFDRDs7Ozs7Ozs7O3FDQTFMQTs7OzREQUkwQixDQUN4QixJQUFNWSxJQUFJLEdBQUcsSUFBYixDQUR3QixDQUNOO0FBQ2xCLHdDQUEyQkEsSUFBM0Isa0JBQ0QsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb21tb24gZGF0YWJhc2UgaGVscGVyIGZ1bmN0aW9ucy5cclxuICovXHJcbmNsYXNzIERCSGVscGVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogRGF0YWJhc2UgVVJMLlxyXG4gICAqIENoYW5nZSB0aGlzIHRvIHJlc3RhdXJhbnRzLmpzb24gZmlsZSBsb2NhdGlvbiBvbiB5b3VyIHNlcnZlci5cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0IERBVEFCQVNFX1VSTCgpIHtcclxuICAgIGNvbnN0IHBvcnQgPSAxMzM3IC8vIENoYW5nZSB0aGlzIHRvIHlvdXIgc2VydmVyIHBvcnRcclxuICAgIHJldHVybiBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9L3Jlc3RhdXJhbnRzYDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGFsbCByZXN0YXVyYW50cy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50cyhjYWxsYmFjaywgaWQpIHtcclxuICAgIC8qIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgIHhoci5vcGVuKCdHRVQnLCBEQkhlbHBlci5EQVRBQkFTRV9VUkwpO1xyXG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkgeyAvLyBHb3QgYSBzdWNjZXNzIHJlc3BvbnNlIGZyb20gc2VydmVyIVxyXG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgIGNvbnN0IHJlc3RhdXJhbnRzID0ganNvbi5yZXN0YXVyYW50cztcclxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50cyk7XHJcbiAgICAgIH0gZWxzZSB7IC8vIE9vcHMhLiBHb3QgYW4gZXJyb3IgZnJvbSBzZXJ2ZXIuXHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoYFJlcXVlc3QgZmFpbGVkLiBSZXR1cm5lZCBzdGF0dXMgb2YgJHt4aHIuc3RhdHVzfWApO1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHhoci5zZW5kKCk7IFxyXG4gICAgKi9cclxuICAgIGxldCBmZXRjaFVSTCA9IERCSGVscGVyLkRBVEFCQVNFX1VSTDtcclxuXHJcbiAgICBpZiAoIWlkKSB7XHJcbiAgICAgIGZldGNoVVJMID0gREJIZWxwZXIuREFUQUJBU0VfVVJMO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZmV0Y2hVUkwgPSBEQkhlbHBlci5EQVRBQkFTRV9VUkwgKyAnLycgKyBpZDtcclxuICAgIH0gXHJcbiAgICBjb25zb2xlLmxvZyhgRmV0Y2hVUkwgaXM6ICR7ZmV0Y2hVUkx9YCk7XHJcblxyXG4gICAgZmV0Y2goZmV0Y2hVUkwpLnRoZW4ocmVzcG9uc2UgPT4ge1xyXG4gICAgICByZXNwb25zZS5qc29uKCkudGhlbihyZXN0YXVyYW50cyA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwicmVzdGF1cmFudHMgSlNPTjogXCIsIHJlc3RhdXJhbnRzKTsgLy8gYWRkZWQgZnJvbSBQcm9qZWN0IHN1cHBsaWVkIHdlYmluYXIgdG8gdHJvdWJsZXNob290IDEwdGggaW1hZ2Ugbm90IGRpc3BsYXlpbmdcclxuICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdGF1cmFudHMpO1xyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goZXJyID0+IHtjb25zdCBlcnJvciA9IChgUmVxdWVzdCBmYWlsZWQuIFJldHVybmVkICR7ZXJyfWApO1xyXG4gICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gIH0pXHJcbn1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggYSByZXN0YXVyYW50IGJ5IGl0cyBJRC5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlJZChpZCwgY2FsbGJhY2spIHtcclxuICAgIC8vIGZldGNoIGFsbCByZXN0YXVyYW50cyB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgY2FsbGJhY2sgdHlwZTogJHt0eXBlb2YgY2FsbGJhY2t9YCk7XHJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHJlc3RhdXJhbnQgPSByZXN0YXVyYW50cy5maW5kKHIgPT4gci5pZCA9PSBpZCk7XHJcbiAgICAgICAgaWYgKHJlc3RhdXJhbnQpIHsgLy8gR290IHRoZSByZXN0YXVyYW50XHJcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50KTtcclxuICAgICAgICB9IGVsc2UgeyAvLyBSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0IGluIHRoZSBkYXRhYmFzZVxyXG4gICAgICAgICAgY2FsbGJhY2soJ1Jlc3RhdXJhbnQgZG9lcyBub3QgZXhpc3QnLCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBjdWlzaW5lIHR5cGUgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudEJ5Q3Vpc2luZShjYWxsYmFjaywgY3Vpc2luZSkge1xyXG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzICB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZ1xyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBGaWx0ZXIgcmVzdGF1cmFudHMgdG8gaGF2ZSBvbmx5IGdpdmVuIGN1aXNpbmUgdHlwZVxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZXN0YXVyYW50cy5maWx0ZXIociA9PiByLmN1aXNpbmVfdHlwZSA9PSBjdWlzaW5lKTtcclxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCByZXN0YXVyYW50cyBieSBhIG5laWdoYm9yaG9vZCB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlOZWlnaGJvcmhvb2QoY2FsbGJhY2ssIG5laWdoYm9yaG9vZCkge1xyXG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXHJcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEZpbHRlciByZXN0YXVyYW50cyB0byBoYXZlIG9ubHkgZ2l2ZW4gbmVpZ2hib3Job29kXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3RhdXJhbnRzLmZpbHRlcihyID0+IHIubmVpZ2hib3Job29kID09IG5laWdoYm9yaG9vZCk7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggcmVzdGF1cmFudHMgYnkgYSBjdWlzaW5lIGFuZCBhIG5laWdoYm9yaG9vZCB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlDdWlzaW5lQW5kTmVpZ2hib3Job29kKGN1aXNpbmUsIG5laWdoYm9yaG9vZCwgY2FsbGJhY2spIHtcclxuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIC8vY29uc29sZS5sb2codHlwZW9mIGNhbGxiYWNrKTtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdHMgPSByZXN0YXVyYW50c1xyXG4gICAgICAgIGlmIChjdWlzaW5lICE9ICdhbGwnKSB7IC8vIGZpbHRlciBieSBjdWlzaW5lXHJcbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIociA9PiByLmN1aXNpbmVfdHlwZSA9PSBjdWlzaW5lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5laWdoYm9yaG9vZCAhPSAnYWxsJykgeyAvLyBmaWx0ZXIgYnkgbmVpZ2hib3Job29kXHJcbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIociA9PiByLm5laWdoYm9yaG9vZCA9PSBuZWlnaGJvcmhvb2QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBhbGwgbmVpZ2hib3Job29kcyB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hOZWlnaGJvcmhvb2RzKGNhbGxiYWNrKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gR2V0IGFsbCBuZWlnaGJvcmhvb2RzIGZyb20gYWxsIHJlc3RhdXJhbnRzXHJcbiAgICAgICAgY29uc3QgbmVpZ2hib3Job29kcyA9IHJlc3RhdXJhbnRzLm1hcCgodiwgaSkgPT4gcmVzdGF1cmFudHNbaV0ubmVpZ2hib3Job29kKVxyXG4gICAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGZyb20gbmVpZ2hib3Job29kc1xyXG4gICAgICAgIGNvbnN0IHVuaXF1ZU5laWdoYm9yaG9vZHMgPSBuZWlnaGJvcmhvb2RzLmZpbHRlcigodiwgaSkgPT4gbmVpZ2hib3Job29kcy5pbmRleE9mKHYpID09IGkpXHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgdW5pcXVlTmVpZ2hib3Job29kcyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggYWxsIGN1aXNpbmVzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaEN1aXNpbmVzKGNhbGxiYWNrKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gR2V0IGFsbCBjdWlzaW5lcyBmcm9tIGFsbCByZXN0YXVyYW50c1xyXG4gICAgICAgIGNvbnN0IGN1aXNpbmVzID0gcmVzdGF1cmFudHMubWFwKCh2LCBpKSA9PiByZXN0YXVyYW50c1tpXS5jdWlzaW5lX3R5cGUpXHJcbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBjdWlzaW5lc1xyXG4gICAgICAgIGNvbnN0IHVuaXF1ZUN1aXNpbmVzID0gY3Vpc2luZXMuZmlsdGVyKCh2LCBpKSA9PiBjdWlzaW5lcy5pbmRleE9mKHYpID09IGkpXHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgdW5pcXVlQ3Vpc2luZXMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RhdXJhbnQgcGFnZSBVUkwuXHJcbiAgICovXHJcbiAgc3RhdGljIHVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkge1xyXG4gICAgcmV0dXJuIChgLi9yZXN0YXVyYW50Lmh0bWw/aWQ9JHtyZXN0YXVyYW50LmlkfWApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdGF1cmFudCBpbWFnZSBVUkwuXHJcbiAgICogQ2hhbmdlIG5lZWRlZCBmb3IgUmVzdCBTZXJ2ZXIgYXMgZXh0ZW5zaW9uIGlzIG5vIGxvbmdlciBzdXBwbGllZFxyXG4gICAqL1xyXG4gIHN0YXRpYyBpbWFnZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkge1xyXG4gICAgLy9jaGFuZ2UgZHVlIHRvIGRhdGFiYXNlIG5vdCBoYXZpbmcgcGhvdG9ncmFwaCB2YWx1ZSBmb3IgZXZlcnkgZW50cnlcclxuICAgIHJldHVybiAoYC9pbWcvJHtyZXN0YXVyYW50LmlkfS5qcGdgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcCBtYXJrZXIgZm9yIGEgcmVzdGF1cmFudC5cclxuICAgKi9cclxuICAgc3RhdGljIG1hcE1hcmtlckZvclJlc3RhdXJhbnQocmVzdGF1cmFudCwgbWFwKSB7XHJcbiAgICAvLyBodHRwczovL2xlYWZsZXRqcy5jb20vcmVmZXJlbmNlLTEuMy4wLmh0bWwjbWFya2VyICBcclxuICAgIGNvbnN0IG1hcmtlciA9IG5ldyBMLm1hcmtlcihbcmVzdGF1cmFudC5sYXRsbmcubGF0LCByZXN0YXVyYW50LmxhdGxuZy5sbmddLFxyXG4gICAgICB7dGl0bGU6IHJlc3RhdXJhbnQubmFtZSxcclxuICAgICAgYWx0OiByZXN0YXVyYW50Lm5hbWUsXHJcbiAgICAgIHVybDogREJIZWxwZXIudXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KVxyXG4gICAgICB9KVxyXG4gICAgICBtYXJrZXIuYWRkVG8obmV3TWFwKTtcclxuICAgIHJldHVybiBtYXJrZXI7XHJcbiAgfSBcclxuICAvKiBzdGF0aWMgbWFwTWFya2VyRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBtYXApIHtcclxuICAgIGNvbnN0IG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICBwb3NpdGlvbjogcmVzdGF1cmFudC5sYXRsbmcsXHJcbiAgICAgIHRpdGxlOiByZXN0YXVyYW50Lm5hbWUsXHJcbiAgICAgIHVybDogREJIZWxwZXIudXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSxcclxuICAgICAgbWFwOiBtYXAsXHJcbiAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1B9XHJcbiAgICApO1xyXG4gICAgcmV0dXJuIG1hcmtlcjtcclxuICB9ICovXHJcblxyXG59XHJcblxyXG4iXSwiZmlsZSI6ImRiaGVscGVyLmpzIn0=

//# sourceMappingURL=dbhelper.js.map
