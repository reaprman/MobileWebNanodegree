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
        response.json().then(function (restaurants) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiaGVscGVyLmpzIl0sIm5hbWVzIjpbIkRCSGVscGVyIiwiY2FsbGJhY2siLCJpZCIsImZldGNoVVJMIiwiREFUQUJBU0VfVVJMIiwiZmV0Y2giLCJ0aGVuIiwicmVzcG9uc2UiLCJqc29uIiwicmVzdGF1cmFudHMiLCJjb25zb2xlIiwibG9nIiwiY2F0Y2giLCJlcnIiLCJlcnJvciIsImZldGNoUmVzdGF1cmFudHMiLCJyZXN0YXVyYW50IiwiZmluZCIsInIiLCJjdWlzaW5lIiwicmVzdWx0cyIsImZpbHRlciIsImN1aXNpbmVfdHlwZSIsIm5laWdoYm9yaG9vZCIsIm5laWdoYm9yaG9vZHMiLCJtYXAiLCJ2IiwiaSIsInVuaXF1ZU5laWdoYm9yaG9vZHMiLCJpbmRleE9mIiwiY3Vpc2luZXMiLCJ1bmlxdWVDdWlzaW5lcyIsIm1hcmtlciIsIkwiLCJsYXRsbmciLCJsYXQiLCJsbmciLCJ0aXRsZSIsIm5hbWUiLCJhbHQiLCJ1cmwiLCJ1cmxGb3JSZXN0YXVyYW50IiwiYWRkVG8iLCJuZXdNYXAiLCJwb3J0Il0sIm1hcHBpbmdzIjoiKy9CQUFBOzs7QUFHTUEsUTs7Ozs7Ozs7Ozs7QUFXSjs7O0FBR3dCQyxJQUFBQSxRLEVBQVVDLEUsRUFBSTtBQUNwQzs7Ozs7Ozs7Ozs7Ozs7QUFjQSxVQUFJQyxRQUFRLEdBQUdILFFBQVEsQ0FBQ0ksWUFBeEI7O0FBRUEsVUFBSSxDQUFDRixFQUFMLEVBQVM7QUFDUEMsUUFBQUEsUUFBUSxHQUFHSCxRQUFRLENBQUNJLFlBQXBCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xELFFBQUFBLFFBQVEsR0FBR0gsUUFBUSxDQUFDSSxZQUFULEdBQXdCLEdBQXhCLEdBQThCRixFQUF6QztBQUNEOztBQUVDRyxNQUFBQSxLQUFLLENBQUNGLFFBQUQsQ0FBTCxDQUFnQkcsSUFBaEIsQ0FBcUIsVUFBQUMsUUFBUSxFQUFJO0FBQ2pDQSxRQUFBQSxRQUFRLENBQUNDLElBQVQsR0FBZ0JGLElBQWhCLENBQXFCLFVBQUFHLFdBQVcsRUFBSTtB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QUFNWSxJQUFJLEdBQUcsSUFBYixDQUR3QixDQUNOO0FBQ2xCLHdDQUEyQkEsSUFBM0Isa0JBQ0QsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29tbW9uIGRhdGFiYXNlIGhlbHBlciBmdW5jdGlvbnMuXG4gKi9cbmNsYXNzIERCSGVscGVyIHtcblxuICAvKipcbiAgICogRGF0YWJhc2UgVVJMLlxuICAgKiBDaGFuZ2UgdGhpcyB0byByZXN0YXVyYW50cy5qc29uIGZpbGUgbG9jYXRpb24gb24geW91ciBzZXJ2ZXIuXG4gICAqL1xuICBzdGF0aWMgZ2V0IERBVEFCQVNFX1VSTCgpIHtcbiAgICBjb25zdCBwb3J0ID0gMTMzNyAvLyBDaGFuZ2UgdGhpcyB0byB5b3VyIHNlcnZlciBwb3J0XG4gICAgcmV0dXJuIGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vcmVzdGF1cmFudHNgO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGFsbCByZXN0YXVyYW50cy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRzKGNhbGxiYWNrLCBpZCkge1xuICAgIC8qIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgREJIZWxwZXIuREFUQUJBU0VfVVJMKTtcbiAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkgeyAvLyBHb3QgYSBzdWNjZXNzIHJlc3BvbnNlIGZyb20gc2VydmVyIVxuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgY29uc3QgcmVzdGF1cmFudHMgPSBqc29uLnJlc3RhdXJhbnRzO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50cyk7XG4gICAgICB9IGVsc2UgeyAvLyBPb3BzIS4gR290IGFuIGVycm9yIGZyb20gc2VydmVyLlxuICAgICAgICBjb25zdCBlcnJvciA9IChgUmVxdWVzdCBmYWlsZWQuIFJldHVybmVkIHN0YXR1cyBvZiAke3hoci5zdGF0dXN9YCk7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHhoci5zZW5kKCk7IFxuICAgICovXG4gICAgbGV0IGZldGNoVVJMID0gREJIZWxwZXIuREFUQUJBU0VfVVJMO1xuXG4gICAgaWYgKCFpZCkge1xuICAgICAgZmV0Y2hVUkwgPSBEQkhlbHBlci5EQVRBQkFTRV9VUkw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZldGNoVVJMID0gREJIZWxwZXIuREFUQUJBU0VfVVJMICsgJy8nICsgaWQ7XG4gICAgfVxuXG4gICAgICBmZXRjaChmZXRjaFVSTCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICByZXNwb25zZS5qc29uKCkudGhlbihyZXN0YXVyYW50cyA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcInJlc3RhdXJhbnRzIEpTT046IFwiLCByZXN0YXVyYW50cyk7IC8vIGFkZGVkIGZyb20gUHJvamVjdCBzdXBwbGllZCB3ZWJpbmFyIHRvIHRyb3VibGVzaG9vdCAxMHRoIGltYWdlIG5vdCBkaXNwbGF5aW5nXG4gICAgICBjYWxsYmFjayhudWxsLCByZXN0YXVyYW50cyk7XG4gICAgICB9KTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgIGNvbnN0IGVycm9yID0gKGBSZXF1ZXN0IGZhaWxlZC4gUmV0dXJuZWQgJHtlcnJ9YCk7XG4gICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICB9KTtcbn1cblxuICAvKipcbiAgICogRmV0Y2ggYSByZXN0YXVyYW50IGJ5IGl0cyBJRC5cbiAgICovXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUlkKGlkLCBjYWxsYmFjaykge1xuICAgIC8vIGZldGNoIGFsbCByZXN0YXVyYW50cyB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgY2FsbGJhY2sgdHlwZTogJHt0eXBlb2YgY2FsbGJhY2t9YCk7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlc3RhdXJhbnQgPSByZXN0YXVyYW50cy5maW5kKHIgPT4gci5pZCA9PSBpZCk7XG4gICAgICAgIGlmIChyZXN0YXVyYW50KSB7IC8vIEdvdCB0aGUgcmVzdGF1cmFudFxuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3RhdXJhbnQpO1xuICAgICAgICB9IGVsc2UgeyAvLyBSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0IGluIHRoZSBkYXRhYmFzZVxuICAgICAgICAgIGNhbGxiYWNrKCdSZXN0YXVyYW50IGRvZXMgbm90IGV4aXN0JywgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCByZXN0YXVyYW50cyBieSBhIGN1aXNpbmUgdHlwZSB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeUN1aXNpbmUoY2FsbGJhY2ssIGN1aXNpbmUpIHtcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHMgIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRmlsdGVyIHJlc3RhdXJhbnRzIHRvIGhhdmUgb25seSBnaXZlbiBjdWlzaW5lIHR5cGVcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3RhdXJhbnRzLmZpbHRlcihyID0+IHIuY3Vpc2luZV90eXBlID09IGN1aXNpbmUpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCByZXN0YXVyYW50cyBieSBhIG5laWdoYm9yaG9vZCB3aXRoIHByb3BlciBlcnJvciBoYW5kbGluZy5cbiAgICovXG4gIHN0YXRpYyBmZXRjaFJlc3RhdXJhbnRCeU5laWdoYm9yaG9vZChjYWxsYmFjaywgbmVpZ2hib3Job29kKSB7XG4gICAgLy8gRmV0Y2ggYWxsIHJlc3RhdXJhbnRzXG4gICAgREJIZWxwZXIuZmV0Y2hSZXN0YXVyYW50cygoZXJyb3IsIHJlc3RhdXJhbnRzKSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRmlsdGVyIHJlc3RhdXJhbnRzIHRvIGhhdmUgb25seSBnaXZlbiBuZWlnaGJvcmhvb2RcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3RhdXJhbnRzLmZpbHRlcihyID0+IHIubmVpZ2hib3Job29kID09IG5laWdoYm9yaG9vZCk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIHJlc3RhdXJhbnRzIGJ5IGEgY3Vpc2luZSBhbmQgYSBuZWlnaGJvcmhvb2Qgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hSZXN0YXVyYW50QnlDdWlzaW5lQW5kTmVpZ2hib3Job29kKGN1aXNpbmUsIG5laWdoYm9yaG9vZCwgY2FsbGJhY2spIHtcbiAgICAvLyBGZXRjaCBhbGwgcmVzdGF1cmFudHNcbiAgICBEQkhlbHBlci5mZXRjaFJlc3RhdXJhbnRzKChlcnJvciwgcmVzdGF1cmFudHMpID0+IHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAvL2NvbnNvbGUubG9nKHR5cGVvZiBjYWxsYmFjayk7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCByZXN1bHRzID0gcmVzdGF1cmFudHNcbiAgICAgICAgaWYgKGN1aXNpbmUgIT0gJ2FsbCcpIHsgLy8gZmlsdGVyIGJ5IGN1aXNpbmVcbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIociA9PiByLmN1aXNpbmVfdHlwZSA9PSBjdWlzaW5lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmVpZ2hib3Job29kICE9ICdhbGwnKSB7IC8vIGZpbHRlciBieSBuZWlnaGJvcmhvb2RcbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIociA9PiByLm5laWdoYm9yaG9vZCA9PSBuZWlnaGJvcmhvb2QpO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGFsbCBuZWlnaGJvcmhvb2RzIHdpdGggcHJvcGVyIGVycm9yIGhhbmRsaW5nLlxuICAgKi9cbiAgc3RhdGljIGZldGNoTmVpZ2hib3Job29kcyhjYWxsYmFjaykge1xuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEdldCBhbGwgbmVpZ2hib3Job29kcyBmcm9tIGFsbCByZXN0YXVyYW50c1xuICAgICAgICBjb25zdCBuZWlnaGJvcmhvb2RzID0gcmVzdGF1cmFudHMubWFwKCh2LCBpKSA9PiByZXN0YXVyYW50c1tpXS5uZWlnaGJvcmhvb2QpXG4gICAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGZyb20gbmVpZ2hib3Job29kc1xuICAgICAgICBjb25zdCB1bmlxdWVOZWlnaGJvcmhvb2RzID0gbmVpZ2hib3Job29kcy5maWx0ZXIoKHYsIGkpID0+IG5laWdoYm9yaG9vZHMuaW5kZXhPZih2KSA9PSBpKVxuICAgICAgICBjYWxsYmFjayhudWxsLCB1bmlxdWVOZWlnaGJvcmhvb2RzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBhbGwgY3Vpc2luZXMgd2l0aCBwcm9wZXIgZXJyb3IgaGFuZGxpbmcuXG4gICAqL1xuICBzdGF0aWMgZmV0Y2hDdWlzaW5lcyhjYWxsYmFjaykge1xuICAgIC8vIEZldGNoIGFsbCByZXN0YXVyYW50c1xuICAgIERCSGVscGVyLmZldGNoUmVzdGF1cmFudHMoKGVycm9yLCByZXN0YXVyYW50cykgPT4ge1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEdldCBhbGwgY3Vpc2luZXMgZnJvbSBhbGwgcmVzdGF1cmFudHNcbiAgICAgICAgY29uc3QgY3Vpc2luZXMgPSByZXN0YXVyYW50cy5tYXAoKHYsIGkpID0+IHJlc3RhdXJhbnRzW2ldLmN1aXNpbmVfdHlwZSlcbiAgICAgICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbSBjdWlzaW5lc1xuICAgICAgICBjb25zdCB1bmlxdWVDdWlzaW5lcyA9IGN1aXNpbmVzLmZpbHRlcigodiwgaSkgPT4gY3Vpc2luZXMuaW5kZXhPZih2KSA9PSBpKVxuICAgICAgICBjYWxsYmFjayhudWxsLCB1bmlxdWVDdWlzaW5lcyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzdGF1cmFudCBwYWdlIFVSTC5cbiAgICovXG4gIHN0YXRpYyB1cmxGb3JSZXN0YXVyYW50KHJlc3RhdXJhbnQpIHtcbiAgICByZXR1cm4gKGAuL3Jlc3RhdXJhbnQuaHRtbD9pZD0ke3Jlc3RhdXJhbnQuaWR9YCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzdGF1cmFudCBpbWFnZSBVUkwuXG4gICAqIENoYW5nZSBuZWVkZWQgZm9yIFJlc3QgU2VydmVyIGFzIGV4dGVuc2lvbiBpcyBubyBsb25nZXIgc3VwcGxpZWRcbiAgICovXG4gIHN0YXRpYyBpbWFnZVVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCkge1xuICAgIC8vY2hhbmdlIGR1ZSB0byBkYXRhYmFzZSBub3QgaGF2aW5nIHBob3RvZ3JhcGggdmFsdWUgZm9yIGV2ZXJ5IGVudHJ5XG4gICAgcmV0dXJuIChgL2ltZy8ke3Jlc3RhdXJhbnQuaWR9LmpwZ2ApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcCBtYXJrZXIgZm9yIGEgcmVzdGF1cmFudC5cbiAgICovXG4gICBzdGF0aWMgbWFwTWFya2VyRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBtYXApIHtcbiAgICAvLyBodHRwczovL2xlYWZsZXRqcy5jb20vcmVmZXJlbmNlLTEuMy4wLmh0bWwjbWFya2VyICBcbiAgICBjb25zdCBtYXJrZXIgPSBuZXcgTC5tYXJrZXIoW3Jlc3RhdXJhbnQubGF0bG5nLmxhdCwgcmVzdGF1cmFudC5sYXRsbmcubG5nXSxcbiAgICAgIHt0aXRsZTogcmVzdGF1cmFudC5uYW1lLFxuICAgICAgYWx0OiByZXN0YXVyYW50Lm5hbWUsXG4gICAgICB1cmw6IERCSGVscGVyLnVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudClcbiAgICAgIH0pXG4gICAgICBtYXJrZXIuYWRkVG8obmV3TWFwKTtcbiAgICByZXR1cm4gbWFya2VyO1xuICB9IFxuICAvKiBzdGF0aWMgbWFwTWFya2VyRm9yUmVzdGF1cmFudChyZXN0YXVyYW50LCBtYXApIHtcbiAgICBjb25zdCBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICAgIHBvc2l0aW9uOiByZXN0YXVyYW50LmxhdGxuZyxcbiAgICAgIHRpdGxlOiByZXN0YXVyYW50Lm5hbWUsXG4gICAgICB1cmw6IERCSGVscGVyLnVybEZvclJlc3RhdXJhbnQocmVzdGF1cmFudCksXG4gICAgICBtYXA6IG1hcCxcbiAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1B9XG4gICAgKTtcbiAgICByZXR1cm4gbWFya2VyO1xuICB9ICovXG5cbn1cblxuIl0sImZpbGUiOiJkYmhlbHBlci5qcyJ9

//# sourceMappingURL=dbhelper.js.map
