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

      fetch(fetchURL, { method: 'GET' }).then(function (response) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIl0sIm5hbWVzIjpbIkRCSGVscGVyIiwiY2FsbGJhY2siLCJpZCIsImZldGNoVVJMIiwiREFUQUJBU0VfVVJMIiwiY29uc29sZSIsImxvZyIsImZldGNoIiwibWV0aG9kIiwidGhlbiIsInJlc3BvbnNlIiwianNvbiIsInJlc3RhdXJhbnRzIiwiY2F0Y2giLCJlcnIiLCJlcnJvciIsImZldGNoUmVzdGF1cmFudHMiLCJyZXN0YXVyYW50IiwiZmluZCIsInIiLCJjdWlzaW5lIiwicmVzdWx0cyIsImZpbHRlciIsImN1aXNpbmVfdHlwZSIsIm5laWdoYm9yaG9vZCIsIm5laWdoYm9yaG9vZHMiLCJtYXAiLCJ2IiwiaSIsInVuaXF1ZU5laWdoYm9yaG9vZHMiLCJpbmRleE9mIiwiY3Vpc2luZXMiLCJ1bmlxdWVDdWlzaW5lcyIsIm1hcmtlciIsIkwiLCJsYXRsbmciLCJsYXQiLCJsbmciLCJ0aXRsZSIsIm5hbWUiLCJhbHQiLCJ1cmwiLCJ1cmxGb3JSZXN0YXVyYW50IiwiYWRkVG8iLCJuZXdNYXAiLCJwb3J0Il0sIm1hcHBpbmdzIjoiKy9CQUFBOzs7QUFHTUEsUTs7Ozs7Ozs7Ozs7QUFXSjs7O0FBR3dCQyxJQUFBQSxRLEVBQVVDLEUsRUFBSTtBQUNwQzs7Ozs7Ozs7Ozs7Ozs7QUFjQSxVQUFJQyxRQUFRLEdBQUdILFFBQVEsQ0FBQ0ksWUFBeEI7O0FBRUEsVUFBSSxDQUFDRixFQUFMLEVBQVM7QUFDUEMsUUFBQUEsUUFBUSxHQUFHSCxRQUFRLENBQUNJLFlBQXBCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xELFFBQUFBLFFBQVEsR0FBR0gsUUFBUSxDQUFDSSxZQUFULEdBQXdCLEdBQXhCLEdBQThCRixFQUF6QztBQUNEO0FBQ0RHLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUix3QkFBNEJILFFBQTVCOztBQUVBSSxNQUFBQSxLQUFLLENBQUNKLFFBQUQsRUFBVyxFQUFFSyxNQUFNLEVBQUUsS0FBVixFQUFYLENBQUwsQ0FBbUNDLElBQW5DLENBQXdD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QVQsQ0FBMEJ6QixVQUExQixDQUZMLEVBRGEsQ0FBZjs7QUFLRWdCLE1BQUFBLE1BQU0sQ0FBQ1UsS0FBUCxDQUFhQyxNQUFiO0FBQ0YsYUFBT1gsTUFBUDtBQUNEO0FBQ0Q7Ozs7Ozs7OztxQ0ExTEE7Ozs0REFJMEIsQ0FDeEIsSUFBTVksSUFBSSxHQUFHLElBQWIsQ0FEd0IsQ0FDTjtBQUNsQix3Q0FBMkJBLElBQTNCLGtCQUNELEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29tbW9uIGRhdGFiYXNlIGhlbHBlciBmdW5jdGlvbnMuXHJcbiAqL1xyXG5jbGFzcyBEQkhlbHBlciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIERhdGFiYXNlIFVSTC5cclxuICAgKiBDaGFuZ2UgdGhpcyB0byByZXN0YXVyYW50cy5qc29uIGZpbGUgbG9jYXRpb24gb24geW91ciBzZXJ2ZXIuXHJcbiAgICovXHJcbiAgc3RhdGljIGdldCBEQVRBQkFTRV9VUkwoKSB7XHJcbiAgICBjb25zdCBwb3J0ID0gMTMzNyAvLyBDaGFuZ2UgdGhpcyB0byB5b3VyIHNlcnZlciBwb3J0XHJcbiAgICByZXR1cm4gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS9yZXN0YXVyYW50c2A7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBhbGwgcmVzdGF1cmFudHMuXHJcbiAgICovXHJcbiAgc3RhdGljIGZldGNoUmVzdGF1cmFudHMoY2FsbGJhY2ssIGlkKSB7XHJcbiAgICAvKiBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICB4aHIub3BlbignR0VUJywgREJIZWxwZXIuREFUQUJBU0VfVVJMKTtcclxuICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHsgLy8gR290IGEgc3VjY2VzcyByZXNwb25zZSBmcm9tIHNlcnZlciFcclxuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICBjb25zdCByZXN0YXVyYW50cyA9IGpzb24ucmVzdGF1cmFudHM7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdGF1cmFudHMpO1xyXG4gICAgICB9IGVsc2UgeyAvLyBPb3BzIS4gR290IGFuIGVycm9yIGZyb20gc2VydmVyLlxyXG4gICAgICAgIGNvbnN0IGVycm9yID0gKGBSZXF1ZXN0IGZhaWxlZC4gUmV0dXJuZWQgc3RhdHVzIG9mICR7eGhyLnN0YXR1c31gKTtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB4aHIuc2VuZCgpOyBcclxuICAgICovXHJcbiAgICBsZXQgZmV0Y2hVUkwgPSBEQkhlbHBlci5EQVRBQkFTRV9VUkw7XHJcblxyXG4gICAgaWYgKCFpZCkge1xyXG4gICAgICBmZXRjaFVSTCA9IERCSGVscGVyLkRBVEFCQVNFX1VSTDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZldGNoVVJMID0gREJIZWxwZXIuREFUQUJBU0VfVVJMICsgJy8nICsgaWQ7XHJcbiAgICB9IFxyXG4gICAgY29uc29sZS5sb2coYEZldGNoVVJMIGlzOiAke2ZldGNoVVJMfWApO1xyXG5cclxuICAgIGZldGNoKGZldGNoVVJMLCB7IG1ldGhvZDogJ0dFVCcgfSkudGhlbihyZXNwb25zZSA9PiB7XHJcbiAgICAgIHJlc3BvbnNlLmpzb24oKS50aGVuKHJlc3RhdXJhbnRzID0+IHtcclxuICAgICAgY29uc29sZS5sb2coXCJyZXN0YXVyYW50cyBKU09OOiBcIiwgcmVzdGF1cmFudHMpOyAvLyBhZGRlZCBmcm9tIFByb2plY3Qgc3VwcGxpZWQgd2ViaW5hciB0byB0cm91Ymxlc2hvb3QgMTB0aCBpbWFnZSBub3QgZGlzcGxheWluZ1xyXG4gICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50cyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5jYXRjaChlcnIgPT4ge2NvbnN0IGVycm9yID0gKGBSZXF1ZXN0IGZhaWxlZC4gUmV0dXJuZWQgJHtlcnJ9YCk7XHJcbiAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgfSlcclxufVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBhIHJlc3RhdXJhbnQgYnkgaXRzIElELlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUlkKGNhbGxiYWNrLCBpZCkge1xyXG4gICAgLy8gZmV0Y2ggYWxsIHJlc3RhdXJhbnRzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XHJcbiAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBjYWxsYmFjayB0eXBlOiAke3R5cGVvZiBjYWxsYmFja31gKTtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgcmVzdGF1cmFudCA9IHJlc3RhdXJhbnRzLmZpbmQociA9PiByLmlkID09IGlkKTtcclxuICAgICAgICBpZiAocmVzdGF1cmFudCkgeyAvLyBHb3QgdGhlIHJlc3RhdXJhbnRcclxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3RhdXJhbnQpO1xyXG4gICAgICAgIH0gZWxzZSB7IC8vIFJlc3RhdXJhbnQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGRhdGFiYXNlXHJcbiAgICAgICAgICBjYWxsYmFjaygnUmVzdGF1cmFudCBkb2VzIG5vdCBleGlzdCcsIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCByZXN0YXVyYW50cyBieSBhIGN1aXNpbmUgdHlwZSB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlDdWlzaW5lKGNhbGxiYWNrLCBjdWlzaW5lKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHMgIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nXHJcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEZpbHRlciByZXN0YXVyYW50cyB0byBoYXZlIG9ubHkgZ2l2ZW4gY3Vpc2luZSB0eXBlXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3RhdXJhbnRzLmZpbHRlcihyID0+IHIuY3Vpc2luZV90eXBlID09IGN1aXNpbmUpO1xyXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgbmVpZ2hib3Job29kIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeU5laWdoYm9yaG9vZChjYWxsYmFjaywgbmVpZ2hib3Job29kKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gRmlsdGVyIHJlc3RhdXJhbnRzIHRvIGhhdmUgb25seSBnaXZlbiBuZWlnaGJvcmhvb2RcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gcmVzdGF1cmFudHMuZmlsdGVyKHIgPT4gci5uZWlnaGJvcmhvb2QgPT0gbmVpZ2hib3Job29kKTtcclxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCByZXN0YXVyYW50cyBieSBhIGN1aXNpbmUgYW5kIGEgbmVpZ2hib3Job29kIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmVBbmROZWlnaGJvcmhvb2QoY3Vpc2luZSwgbmVpZ2hib3Job29kLCBjYWxsYmFjaykge1xyXG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXHJcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codHlwZW9mIGNhbGxiYWNrKTtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdHMgPSByZXN0YXVyYW50c1xyXG4gICAgICAgIGlmIChjdWlzaW5lICE9ICdhbGwnKSB7IC8vIGZpbHRlciBieSBjdWlzaW5lXHJcbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIociA9PiByLmN1aXNpbmVfdHlwZSA9PSBjdWlzaW5lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5laWdoYm9yaG9vZCAhPSAnYWxsJykgeyAvLyBmaWx0ZXIgYnkgbmVpZ2hib3Job29kXHJcbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIociA9PiByLm5laWdoYm9yaG9vZCA9PSBuZWlnaGJvcmhvb2QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBhbGwgbmVpZ2hib3Job29kcyB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZmV0Y2hOZWlnaGJvcmhvb2RzKGNhbGxiYWNrKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gR2V0IGFsbCBuZWlnaGJvcmhvb2RzIGZyb20gYWxsIHJlc3RhdXJhbnRzXHJcbiAgICAgICAgY29uc3QgbmVpZ2hib3Job29kcyA9IHJlc3RhdXJhbnRzLm1hcCgodiwgaSkgPT4gcmVzdGF1cmFudHNbaV0ubmVpZ2hib3Job29kKVxyXG4gICAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGZyb20gbmVpZ2hib3Job29kc1xyXG4gICAgICAgIGNvbnN0IHVuaXF1ZU5laWdoYm9yaG9vZHMgPSBuZWlnaGJvcmhvb2RzLmZpbHRlcigodiwgaSkgPT4gbmVpZ2hib3Job29kcy5pbmRleE9mKHYpID09IGkpXHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgdW5pcXVlTmVpZ2hib3Job29kcyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggYWxsIGN1aXNpbmVzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmZXRjaEN1aXNpbmVzKGNhbGxiYWNrKSB7XHJcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcclxuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xyXG4gICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICBjYWxsYmFjayhlcnJvciwgbnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gR2V0IGFsbCBjdWlzaW5lcyBmcm9tIGFsbCByZXN0YXVyYW50c1xyXG4gICAgICAgIGNvbnN0IGN1aXNpbmVzID0gcmVzdGF1cmFudHMubWFwKCh2LCBpKSA9PiByZXN0YXVyYW50c1tpXS5jdWlzaW5lX3R5cGUpXHJcbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBjdWlzaW5lc1xyXG4gICAgICAgIGNvbnN0IHVuaXF1ZUN1aXNpbmVzID0gY3Vpc2luZXMuZmlsdGVyKCh2LCBpKSA9PiBjdWlzaW5lcy5pbmRleE9mKHYpID09IGkpXHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgdW5pcXVlQ3Vpc2luZXMpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RhdXJhbnQgcGFnZSBVUkwuXHJcbiAgICovXHJcbiAgc3RhdGljIHVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkge1xyXG4gICAgcmV0dXJuIChgLi9yZXN0YXVyYW50Lmh0bWw/aWQ9JHtyZXN0YXVyYW50LmlkfWApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdGF1cmFudCBpbWFnZSBVUkwuXHJcbiAgICogQ2hhbmdlIG5lZWRlZCBmb3IgUmVzdCBTZXJ2ZXIgYXMgZXh0ZW5zaW9uIGlzIG5vIGxvbmdlciBzdXBwbGllZFxyXG4gICAqL1xyXG4gIHN0YXRpYyBpbWFnZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkge1xyXG4gICAgLy9jaGFuZ2UgZHVlIHRvIGRhdGFiYXNlIG5vdCBoYXZpbmcgcGhvdG9ncmFwaCB2YWx1ZSBmb3IgZXZlcnkgZW50cnlcclxuICAgIHJldHVybiAoYC9pbWcvJHtyZXN0YXVyYW50LmlkfS5qcGdgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcCBtYXJrZXIgZm9yIGEgcmVzdGF1cmFudC5cclxuICAgKi9cclxuICAgc3RhdGljIG1hcE1hcmtlckZvclJlc3RhdXJhbnQocmVzdGF1cmFudCwgbWFwKSB7XHJcbiAgICAvLyBodHRwczovL2xlYWZsZXRqcy5jb20vcmVmZXJlbmNlLTEuMy4wLmh0bWwjbWFya2VyICBcclxuICAgIGNvbnN0IG1hcmtlciA9IG5ldyBMLm1hcmtlcihbcmVzdGF1cmFudC5sYXRsbmcubGF0LCByZXN0YXVyYW50LmxhdGxuZy5sbmddLFxyXG4gICAgICB7dGl0bGU6IHJlc3RhdXJhbnQubmFtZSxcclxuICAgICAgYWx0OiByZXN0YXVyYW50Lm5hbWUsXHJcbiAgICAgIHVybDogREJIZWxwZXIudXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KVxyXG4gICAgICB9KVxyXG4gICAgICBtYXJrZXIuYWRkVG8obmV3TWFwKTtcclxuICAgIHJldHVybiBtYXJrZXI7XHJcbiAgfSBcclxuICAvKiBzdGF0aWMgbWFwTWFya2VyRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBtYXApIHtcclxuICAgIGNvbnN0IG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xyXG4gICAgICBwb3NpdGlvbjogcmVzdGF1cmFudC5sYXRsbmcsXHJcbiAgICAgIHRpdGxlOiByZXN0YXVyYW50Lm5hbWUsXHJcbiAgICAgIHVybDogREJIZWxwZXIudXJsRm9yUmVzdGF1cmFudChyZXN0YXVyYW50KSxcclxuICAgICAgbWFwOiBtYXAsXHJcbiAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1B9XHJcbiAgICApO1xyXG4gICAgcmV0dXJuIG1hcmtlcjtcclxuICB9ICovXHJcblxyXG59XHJcblxyXG4iXSwiZmlsZSI6ImRiaGVscGVyLmpzIn0=

//# sourceMappingURL=dbhelper.js.map
