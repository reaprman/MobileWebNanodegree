(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";var _idb = _interopRequireDefault(require("idb"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
var database = 'restaurant-db';
var storeName = 'restaurants';
var review_store = 'reviews';

var dbPromise = _idb.default.open(database, 1, function (upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
      upgradeDb.createObjectStore(storeName, { keyPath: 'id' });
      var keyValStore = upgradeDb.createObjectStore(review_store, { keypath: 'id' });
      keyValStore.createIndex('restaurant_id', 'restaurant_id');}


});

var appCache = 'restaurant-cache';

self.addEventListener('install', function (event) {
  event.waitUntil(
  caches.open(appCache).then(function (cache) {
    return cache.addAll([
    '/',
    '/index.html',
    '/restaurant.html',
    '/manifest.json',
    '/sw.js',
    '/css/styles.css',
    '/js/dbhelper.js',
    '/js/idb.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/js/sw_register.js',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js']);

  }).catch(function (err) {
    console.log('Cache failed to load: ', err);
  }));

});


/*
    To debug fetch code
    url: https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker
    date: 08/04/18
    */
self.addEventListener('fetch', function (event) {
  var urlCheck = new URL(event.request.url);
  // console.log(urlCheck.port);
  if (urlCheck.port === '1337') {
    //go to db and pull resource if there
    //console.log('passed urlCheck');
    handleDatabase(event);
    //else fetch from network look at idb lessons
  } else {
    //only cache if necessary changes needed...
    event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request).then(function (response) {
        return caches.open(appCache).then(function (cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }));
  }
});

var handleReviewEvent = function handleReviewEvent(id, event) {
  event.respondWith(
  dbPromise.then(function (db) {
    return db.transaction(review_store).
    objectStore(review_store).index('restaurant_id').getAll(id);
  }).then(function (reviews) {
    if (!reviews.length > 0) {
      console.log("SW-Review No reviews in idb");
      return fetch(event.request).then(function (response) {
        return response.json();
      }).then(function (reviews) {
        return dbPromise.then(function (db) {
          var tx = db.transaction(review_store, 'readwrite');
          var revStore = tx.objectStore(review_store);
          reviews.forEach(function (review) {
            revStore.put(review, review.id);
          });
          return reviews;
        });
      });
    } else {
      console.log("SW-Review info from DB: ".concat(reviews));
      return reviews;
    }
  }).then(function (finalResponse) {
    return new Response(JSON.stringify(finalResponse));
  }).catch(function (error) {
    return new Response("Error fetching data ".concat(error, " ").concat({ status: 500 }));
  }));

};

var handleRestaurantEvent = function handleRestaurantEvent(event) {
  event.respondWith(
  dbPromise.then(function (db) {
    return db.transaction(storeName).
    objectStore(storeName).getAll();
  }).then(function (restaurants) {
    if (!restaurants.length > 0) {
      return fetch(event.request).then(function (response) {
        return response.json();
      }).then(function (restaurants) {
        return dbPromise.then(function (db) {
          var tx = db.transaction(storeName, 'readwrite');
          var restStore = tx.objectStore(storeName);
          //console.log(`JSON info for DB: ${restaurants}`);
          restaurants.forEach(function (restaurant) {
            restStore.put(restaurant, restaurant.id);
          });
          return restaurants;
        });
      });
    } else {
      //console.log(`DATA from DB: ${restaurants}`);
      return restaurants;
    }
  }).then(function (finalResponse) {
    return new Response(JSON.stringify(finalResponse));
  }).catch(function (error) {
    return new Response("Error fetching data ".concat(error, " ").concat({ status: 500 }));
  }));

};

var handleDatabase = function handleDatabase(event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.indexOf("reviews") > -1) {
    var url = new URL(event.request.url);
    var id = url.searchParams.get("restaurant_id") * 1;
    handleReviewEvent(id, event);
  } else {
    handleRestaurantEvent(event);
  }
};

},{"idb":2}],2:[function(require,module,exports){
'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getKey',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
      if (!(funcName in Constructor.prototype)) return;

      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      if (request) {
        request.onupgradeneeded = function(event) {
          if (upgradeCallback) {
            upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
          }
        };
      }

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
    module.exports.default = module.exports;
  }
  else {
    self.idb = exp;
  }
}());

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc3cuanMiLCJub2RlX21vZHVsZXMvaWRiL2xpYi9pZGIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7YUNBQSxrRDtBQUNBLElBQU0sUUFBUSxHQUFHLGVBQWpCO0FBQ0EsSUFBTSxTQUFTLEdBQUcsYUFBbEI7QUFDQSxJQUFNLFlBQVksR0FBRyxTQUFyQjs7QUFFQSxJQUFNLFNBQVMsR0FBRyxhQUFJLElBQUosQ0FBUyxRQUFULEVBQW1CLENBQW5CLEVBQXNCLFVBQUEsU0FBUyxFQUFJO0FBQ25ELFVBQVEsU0FBUyxDQUFDLFVBQWxCO0FBQ0ksU0FBSyxDQUFMO0FBQ0UsTUFBQSxTQUFTLENBQUMsaUJBQVYsQ0FBNEIsU0FBNUIsRUFBdUMsRUFBRSxPQUFPLEVBQUUsSUFBWCxFQUF2QztBQUNBLFVBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxpQkFBVixDQUE0QixZQUE1QixFQUEwQyxFQUFFLE9BQU8sRUFBRSxJQUFYLEVBQTFDLENBQWxCO0FBQ0EsTUFBQSxXQUFXLENBQUMsV0FBWixDQUF3QixlQUF4QixFQUF5QyxlQUF6QyxFQUpOOzs7QUFPRCxDQVJpQixDQUFsQjs7QUFVQSxJQUFJLFFBQVEsR0FBRyxrQkFBZjs7QUFFQSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsU0FBdEIsRUFBaUMsVUFBUyxLQUFULEVBQWdCO0FBQzlDLEVBQUEsS0FBSyxDQUFDLFNBQU47QUFDTSxFQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBWixFQUFzQixJQUF0QixDQUEyQixVQUFTLEtBQVQsRUFBZ0I7QUFDekMsV0FBTyxLQUFLLENBQUMsTUFBTixDQUFhO0FBQ2pCLE9BRGlCO0FBRWpCLGlCQUZpQjtBQUdqQixzQkFIaUI7QUFJakIsb0JBSmlCO0FBS2pCLFlBTGlCO0FBTWpCLHFCQU5pQjtBQU9qQixxQkFQaUI7QUFRakIsZ0JBUmlCO0FBU2pCLGlCQVRpQjtBQVVqQiw0QkFW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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCBpZGIgZnJvbSAnaWRiJztcbmNvbnN0IGRhdGFiYXNlID0gJ3Jlc3RhdXJhbnQtZGInO1xuY29uc3Qgc3RvcmVOYW1lID0gJ3Jlc3RhdXJhbnRzJztcbmNvbnN0IHJldmlld19zdG9yZSA9ICdyZXZpZXdzJztcblxuY29uc3QgZGJQcm9taXNlID0gaWRiLm9wZW4oZGF0YWJhc2UsIDEsIHVwZ3JhZGVEYiA9PiB7XG4gIHN3aXRjaCAodXBncmFkZURiLm9sZFZlcnNpb24pIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgdXBncmFkZURiLmNyZWF0ZU9iamVjdFN0b3JlKHN0b3JlTmFtZSwgeyBrZXlQYXRoOiAnaWQnIH0pO1xuICAgICAgICBsZXQga2V5VmFsU3RvcmUgPSB1cGdyYWRlRGIuY3JlYXRlT2JqZWN0U3RvcmUocmV2aWV3X3N0b3JlLCB7IGtleXBhdGg6ICdpZCcgfSk7XG4gICAgICAgIGtleVZhbFN0b3JlLmNyZWF0ZUluZGV4KCdyZXN0YXVyYW50X2lkJywgJ3Jlc3RhdXJhbnRfaWQnKTtcblxuICAgIH1cbn0pO1xuXG5sZXQgYXBwQ2FjaGUgPSAncmVzdGF1cmFudC1jYWNoZSc7XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignaW5zdGFsbCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICBldmVudC53YWl0VW50aWwoXG4gICAgICAgICBjYWNoZXMub3BlbihhcHBDYWNoZSkudGhlbihmdW5jdGlvbihjYWNoZSkge1xuICAgICAgICAgICByZXR1cm4gY2FjaGUuYWRkQWxsKFtcbiAgICAgICAgICAgICAgJy8nLFxuICAgICAgICAgICAgICAnL2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgICAnL3Jlc3RhdXJhbnQuaHRtbCcsXG4gICAgICAgICAgICAgICcvbWFuaWZlc3QuanNvbicsXG4gICAgICAgICAgICAgICcvc3cuanMnLFxuICAgICAgICAgICAgICAnL2Nzcy9zdHlsZXMuY3NzJyxcbiAgICAgICAgICAgICAgJy9qcy9kYmhlbHBlci5qcycsXG4gICAgICAgICAgICAgICcvanMvaWRiLmpzJyxcbiAgICAgICAgICAgICAgJy9qcy9tYWluLmpzJyxcbiAgICAgICAgICAgICAgJy9qcy9yZXN0YXVyYW50X2luZm8uanMnLFxuICAgICAgICAgICAgICAnL2pzL3N3X3JlZ2lzdGVyLmpzJyxcbiAgICAgICAgICAgICAgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXRAMS4zLjEvZGlzdC9sZWFmbGV0LmNzcycsXG4gICAgICAgICAgICAgICdodHRwczovL3VucGtnLmNvbS9sZWFmbGV0QDEuMy4xL2Rpc3QvbGVhZmxldC5qcydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWNoZSBmYWlsZWQgdG8gbG9hZDogJywgZXJyKTtcbiAgICAgICAgIH0pXG4gICAgICk7XG4gfSk7XG4gXG5cbi8qXG5UbyBkZWJ1ZyBmZXRjaCBjb2RlXG51cmw6IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3dlYi9pbHQvcHdhL2xhYi1jYWNoaW5nLWZpbGVzLXdpdGgtc2VydmljZS13b3JrZXJcbmRhdGU6IDA4LzA0LzE4XG4qL1xuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdmZXRjaCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciB1cmxDaGVjayA9IG5ldyBVUkwoZXZlbnQucmVxdWVzdC51cmwpO1xuICAgIC8vIGNvbnNvbGUubG9nKHVybENoZWNrLnBvcnQpO1xuICAgIGlmICh1cmxDaGVjay5wb3J0ID09PSAnMTMzNycpIHtcbiAgICAgIC8vZ28gdG8gZGIgYW5kIHB1bGwgcmVzb3VyY2UgaWYgdGhlcmVcbiAgICAgIC8vY29uc29sZS5sb2coJ3Bhc3NlZCB1cmxDaGVjaycpO1xuICAgICAgaGFuZGxlRGF0YWJhc2UoZXZlbnQpO1xuICAgICAgLy9lbHNlIGZldGNoIGZyb20gbmV0d29yayBsb29rIGF0IGlkYiBsZXNzb25zXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vb25seSBjYWNoZSBpZiBuZWNlc3NhcnkgY2hhbmdlcyBuZWVkZWQuLi5cbiAgICAgIGV2ZW50LnJlc3BvbmRXaXRoKCBcbiAgICAgIGNhY2hlcy5tYXRjaChldmVudC5yZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UgfHwgZmV0Y2goZXZlbnQucmVxdWVzdCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGNhY2hlcy5vcGVuKGFwcENhY2hlKS50aGVuKGNhY2hlID0+IHtcbiAgICAgICAgICAgIGNhY2hlLnB1dChldmVudC5yZXF1ZXN0LCByZXNwb25zZS5jbG9uZSgpKTtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSkpO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgaGFuZGxlUmV2aWV3RXZlbnQgPSAoaWQsIGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucmVzcG9uZFdpdGgoXG4gICAgICBkYlByb21pc2UudGhlbihkYiA9PiB7XG4gICAgICAgIHJldHVybiBkYi50cmFuc2FjdGlvbihyZXZpZXdfc3RvcmUpXG4gICAgICAgIC5vYmplY3RTdG9yZShyZXZpZXdfc3RvcmUpLmluZGV4KCdyZXN0YXVyYW50X2lkJykuZ2V0QWxsKGlkKTtcbiAgICAgIH0pLnRoZW4ocmV2aWV3cyA9PiB7XG4gICAgICAgIGlmKCFyZXZpZXdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgU1ctUmV2aWV3IE5vIHJldmlld3MgaW4gaWRiYCk7XG4gICAgICAgICAgcmV0dXJuIGZldGNoKGV2ZW50LnJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICB9KS50aGVuKHJldmlld3MgPT4ge1xuICAgICAgICAgICAgIHJldHVybiBkYlByb21pc2UudGhlbihkYiA9PntcbiAgICAgICAgICAgICAgY29uc3QgdHggPSBkYi50cmFuc2FjdGlvbihyZXZpZXdfc3RvcmUsICdyZWFkd3JpdGUnKTtcbiAgICAgICAgICAgICAgY29uc3QgcmV2U3RvcmUgPSB0eC5vYmplY3RTdG9yZShyZXZpZXdfc3RvcmUpO1xuICAgICAgICAgICAgICByZXZpZXdzLmZvckVhY2gocmV2aWV3ID0+IHtcbiAgICAgICAgICAgICAgICByZXZTdG9yZS5wdXQocmV2aWV3LCByZXZpZXcuaWQpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJldmlld3M7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgY29uc29sZS5sb2coYFNXLVJldmlldyBpbmZvIGZyb20gREI6ICR7cmV2aWV3c31gKTtcbiAgICAgICAgICByZXR1cm4gcmV2aWV3cztcbiAgICAgICAgfVxuICAgICAgfSkudGhlbihmaW5hbFJlc3BvbnNlID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShmaW5hbFJlc3BvbnNlKSk7XG4gICAgICB9KS5jYXRjaChlcnJvciA9PntcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShgRXJyb3IgZmV0Y2hpbmcgZGF0YSAke2Vycm9yfSAke3tzdGF0dXM6IDUwMH19YCk7XG4gICAgICB9KVxuICAgIClcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZVJlc3RhdXJhbnRFdmVudD0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucmVzcG9uZFdpdGgoXG4gICAgICBkYlByb21pc2UudGhlbihkYiA9PiB7XG4gICAgICAgIHJldHVybiBkYi50cmFuc2FjdGlvbihzdG9yZU5hbWUpXG4gICAgICAgIC5vYmplY3RTdG9yZShzdG9yZU5hbWUpLmdldEFsbCgpO1xuICAgICAgfSkudGhlbihyZXN0YXVyYW50cyA9PiB7XG4gICAgICAgIGlmICghcmVzdGF1cmFudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiBmZXRjaChldmVudC5yZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgfSkudGhlbihyZXN0YXVyYW50cyA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBkYlByb21pc2UudGhlbihkYiA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHR4ID0gZGIudHJhbnNhY3Rpb24oc3RvcmVOYW1lLCdyZWFkd3JpdGUnKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdFN0b3JlID0gdHgub2JqZWN0U3RvcmUoc3RvcmVOYW1lKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGBKU09OIGluZm8gZm9yIERCOiAke3Jlc3RhdXJhbnRzfWApO1xuICAgICAgICAgICAgICAgIHJlc3RhdXJhbnRzLmZvckVhY2gocmVzdGF1cmFudCA9PnsgXG4gICAgICAgICAgICAgICAgICByZXN0U3RvcmUucHV0KHJlc3RhdXJhbnQsIHJlc3RhdXJhbnQuaWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN0YXVyYW50c1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhgREFUQSBmcm9tIERCOiAke3Jlc3RhdXJhbnRzfWApO1xuICAgICAgICAgIHJldHVybiByZXN0YXVyYW50czsgXG4gICAgICAgIH1cbiAgICAgIH0pLnRoZW4oZmluYWxSZXNwb25zZSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoZmluYWxSZXNwb25zZSkpO1xuICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGBFcnJvciBmZXRjaGluZyBkYXRhICR7ZXJyb3J9ICR7e3N0YXR1czogNTAwfX1gKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZURhdGFiYXNlID0gKGV2ZW50KSA9PiB7XG4gICAgaWYoZXZlbnQucmVxdWVzdC5tZXRob2QgIT09ICdHRVQnKSByZXR1cm47XG4gICAgaWYoZXZlbnQucmVxdWVzdC51cmwuaW5kZXhPZihcInJldmlld3NcIikgPiAtMSl7XG4gICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKGV2ZW50LnJlcXVlc3QudXJsKTtcbiAgICAgIGNvbnN0IGlkID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoXCJyZXN0YXVyYW50X2lkXCIpICogMTtcbiAgICAgIGhhbmRsZVJldmlld0V2ZW50KGlkLCBldmVudCk7XG4gICAgfWVsc2V7XG4gICAgICBoYW5kbGVSZXN0YXVyYW50RXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgfSIsIid1c2Ugc3RyaWN0JztcblxuKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiB0b0FycmF5KGFycikge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvbWlzaWZ5UmVxdWVzdChyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZXF1ZXN0LnJlc3VsdCk7XG4gICAgICB9O1xuXG4gICAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlcXVlc3QuZXJyb3IpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3RDYWxsKG9iaiwgbWV0aG9kLCBhcmdzKSB7XG4gICAgdmFyIHJlcXVlc3Q7XG4gICAgdmFyIHAgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlcXVlc3QgPSBvYmpbbWV0aG9kXS5hcHBseShvYmosIGFyZ3MpO1xuICAgICAgcHJvbWlzaWZ5UmVxdWVzdChyZXF1ZXN0KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG5cbiAgICBwLnJlcXVlc3QgPSByZXF1ZXN0O1xuICAgIHJldHVybiBwO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvbWlzaWZ5Q3Vyc29yUmVxdWVzdENhbGwob2JqLCBtZXRob2QsIGFyZ3MpIHtcbiAgICB2YXIgcCA9IHByb21pc2lmeVJlcXVlc3RDYWxsKG9iaiwgbWV0aG9kLCBhcmdzKTtcbiAgICByZXR1cm4gcC50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIXZhbHVlKSByZXR1cm47XG4gICAgICByZXR1cm4gbmV3IEN1cnNvcih2YWx1ZSwgcC5yZXF1ZXN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5UHJvcGVydGllcyhQcm94eUNsYXNzLCB0YXJnZXRQcm9wLCBwcm9wZXJ0aWVzKSB7XG4gICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShQcm94eUNsYXNzLnByb3RvdHlwZSwgcHJvcCwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzW3RhcmdldFByb3BdW3Byb3BdO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgIHRoaXNbdGFyZ2V0UHJvcF1bcHJvcF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJveHlSZXF1ZXN0TWV0aG9kcyhQcm94eUNsYXNzLCB0YXJnZXRQcm9wLCBDb25zdHJ1Y3RvciwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBpZiAoIShwcm9wIGluIENvbnN0cnVjdG9yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICAgIFByb3h5Q2xhc3MucHJvdG90eXBlW3Byb3BdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0Q2FsbCh0aGlzW3RhcmdldFByb3BdLCBwcm9wLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5TWV0aG9kcyhQcm94eUNsYXNzLCB0YXJnZXRQcm9wLCBDb25zdHJ1Y3RvciwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBpZiAoIShwcm9wIGluIENvbnN0cnVjdG9yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICAgIFByb3h5Q2xhc3MucHJvdG90eXBlW3Byb3BdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzW3RhcmdldFByb3BdW3Byb3BdLmFwcGx5KHRoaXNbdGFyZ2V0UHJvcF0sIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJveHlDdXJzb3JSZXF1ZXN0TWV0aG9kcyhQcm94eUNsYXNzLCB0YXJnZXRQcm9wLCBDb25zdHJ1Y3RvciwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBpZiAoIShwcm9wIGluIENvbnN0cnVjdG9yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICAgIFByb3h5Q2xhc3MucHJvdG90eXBlW3Byb3BdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNpZnlDdXJzb3JSZXF1ZXN0Q2FsbCh0aGlzW3RhcmdldFByb3BdLCBwcm9wLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIEluZGV4KGluZGV4KSB7XG4gICAgdGhpcy5faW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIHByb3h5UHJvcGVydGllcyhJbmRleCwgJ19pbmRleCcsIFtcbiAgICAnbmFtZScsXG4gICAgJ2tleVBhdGgnLFxuICAgICdtdWx0aUVudHJ5JyxcbiAgICAndW5pcXVlJ1xuICBdKTtcblxuICBwcm94eVJlcXVlc3RNZXRob2RzKEluZGV4LCAnX2luZGV4JywgSURCSW5kZXgsIFtcbiAgICAnZ2V0JyxcbiAgICAnZ2V0S2V5JyxcbiAgICAnZ2V0QWxsJyxcbiAgICAnZ2V0QWxsS2V5cycsXG4gICAgJ2NvdW50J1xuICBdKTtcblxuICBwcm94eUN1cnNvclJlcXVlc3RNZXRob2RzKEluZGV4LCAnX2luZGV4JywgSURCSW5kZXgsIFtcbiAgICAnb3BlbkN1cnNvcicsXG4gICAgJ29wZW5LZXlDdXJzb3InXG4gIF0pO1xuXG4gIGZ1bmN0aW9uIEN1cnNvcihjdXJzb3IsIHJlcXVlc3QpIHtcbiAgICB0aGlzLl9jdXJzb3IgPSBjdXJzb3I7XG4gICAgdGhpcy5fcmVxdWVzdCA9IHJlcXVlc3Q7XG4gIH1cblxuICBwcm94eVByb3BlcnRpZXMoQ3Vyc29yLCAnX2N1cnNvcicsIFtcbiAgICAnZGlyZWN0aW9uJyxcbiAgICAna2V5JyxcbiAgICAncHJpbWFyeUtleScsXG4gICAgJ3ZhbHVlJ1xuICBdKTtcblxuICBwcm94eVJlcXVlc3RNZXRob2RzKEN1cnNvciwgJ19jdXJzb3InLCBJREJDdXJzb3IsIFtcbiAgICAndXBkYXRlJyxcbiAgICAnZGVsZXRlJ1xuICBdKTtcblxuICAvLyBwcm94eSAnbmV4dCcgbWV0aG9kc1xuICBbJ2FkdmFuY2UnLCAnY29udGludWUnLCAnY29udGludWVQcmltYXJ5S2V5J10uZm9yRWFjaChmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgaWYgKCEobWV0aG9kTmFtZSBpbiBJREJDdXJzb3IucHJvdG90eXBlKSkgcmV0dXJuO1xuICAgIEN1cnNvci5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdXJzb3IgPSB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgY3Vyc29yLl9jdXJzb3JbbWV0aG9kTmFtZV0uYXBwbHkoY3Vyc29yLl9jdXJzb3IsIGFyZ3MpO1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdChjdXJzb3IuX3JlcXVlc3QpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm47XG4gICAgICAgICAgcmV0dXJuIG5ldyBDdXJzb3IodmFsdWUsIGN1cnNvci5fcmVxdWVzdCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gT2JqZWN0U3RvcmUoc3RvcmUpIHtcbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JlO1xuICB9XG5cbiAgT2JqZWN0U3RvcmUucHJvdG90eXBlLmNyZWF0ZUluZGV4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBJbmRleCh0aGlzLl9zdG9yZS5jcmVhdGVJbmRleC5hcHBseSh0aGlzLl9zdG9yZSwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgT2JqZWN0U3RvcmUucHJvdG90eXBlLmluZGV4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBJbmRleCh0aGlzLl9zdG9yZS5pbmRleC5hcHBseSh0aGlzLl9zdG9yZSwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgcHJveHlQcm9wZXJ0aWVzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgW1xuICAgICduYW1lJyxcbiAgICAna2V5UGF0aCcsXG4gICAgJ2luZGV4TmFtZXMnLFxuICAgICdhdXRvSW5jcmVtZW50J1xuICBdKTtcblxuICBwcm94eVJlcXVlc3RNZXRob2RzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgSURCT2JqZWN0U3RvcmUsIFtcbiAgICAncHV0JyxcbiAgICAnYWRkJyxcbiAgICAnZGVsZXRlJyxcbiAgICAnY2xlYXInLFxuICAgICdnZXQnLFxuICAgICdnZXRBbGwnLFxuICAgICdnZXRLZXknLFxuICAgICdnZXRBbGxLZXlzJyxcbiAgICAnY291bnQnXG4gIF0pO1xuXG4gIHByb3h5Q3Vyc29yUmVxdWVzdE1ldGhvZHMoT2JqZWN0U3RvcmUsICdfc3RvcmUnLCBJREJPYmplY3RTdG9yZSwgW1xuICAgICdvcGVuQ3Vyc29yJyxcbiAgICAnb3BlbktleUN1cnNvcidcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgSURCT2JqZWN0U3RvcmUsIFtcbiAgICAnZGVsZXRlSW5kZXgnXG4gIF0pO1xuXG4gIGZ1bmN0aW9uIFRyYW5zYWN0aW9uKGlkYlRyYW5zYWN0aW9uKSB7XG4gICAgdGhpcy5fdHggPSBpZGJUcmFuc2FjdGlvbjtcbiAgICB0aGlzLmNvbXBsZXRlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpZGJUcmFuc2FjdGlvbi5vbmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgICBpZGJUcmFuc2FjdGlvbi5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChpZGJUcmFuc2FjdGlvbi5lcnJvcik7XG4gICAgICB9O1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QoaWRiVHJhbnNhY3Rpb24uZXJyb3IpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIFRyYW5zYWN0aW9uLnByb3RvdHlwZS5vYmplY3RTdG9yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgT2JqZWN0U3RvcmUodGhpcy5fdHgub2JqZWN0U3RvcmUuYXBwbHkodGhpcy5fdHgsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhUcmFuc2FjdGlvbiwgJ190eCcsIFtcbiAgICAnb2JqZWN0U3RvcmVOYW1lcycsXG4gICAgJ21vZGUnXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhUcmFuc2FjdGlvbiwgJ190eCcsIElEQlRyYW5zYWN0aW9uLCBbXG4gICAgJ2Fib3J0J1xuICBdKTtcblxuICBmdW5jdGlvbiBVcGdyYWRlREIoZGIsIG9sZFZlcnNpb24sIHRyYW5zYWN0aW9uKSB7XG4gICAgdGhpcy5fZGIgPSBkYjtcbiAgICB0aGlzLm9sZFZlcnNpb24gPSBvbGRWZXJzaW9uO1xuICAgIHRoaXMudHJhbnNhY3Rpb24gPSBuZXcgVHJhbnNhY3Rpb24odHJhbnNhY3Rpb24pO1xuICB9XG5cbiAgVXBncmFkZURCLnByb3RvdHlwZS5jcmVhdGVPYmplY3RTdG9yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgT2JqZWN0U3RvcmUodGhpcy5fZGIuY3JlYXRlT2JqZWN0U3RvcmUuYXBwbHkodGhpcy5fZGIsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhVcGdyYWRlREIsICdfZGInLCBbXG4gICAgJ25hbWUnLFxuICAgICd2ZXJzaW9uJyxcbiAgICAnb2JqZWN0U3RvcmVOYW1lcydcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKFVwZ3JhZGVEQiwgJ19kYicsIElEQkRhdGFiYXNlLCBbXG4gICAgJ2RlbGV0ZU9iamVjdFN0b3JlJyxcbiAgICAnY2xvc2UnXG4gIF0pO1xuXG4gIGZ1bmN0aW9uIERCKGRiKSB7XG4gICAgdGhpcy5fZGIgPSBkYjtcbiAgfVxuXG4gIERCLnByb3RvdHlwZS50cmFuc2FjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgVHJhbnNhY3Rpb24odGhpcy5fZGIudHJhbnNhY3Rpb24uYXBwbHkodGhpcy5fZGIsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhEQiwgJ19kYicsIFtcbiAgICAnbmFtZScsXG4gICAgJ3ZlcnNpb24nLFxuICAgICdvYmplY3RTdG9yZU5hbWVzJ1xuICBdKTtcblxuICBwcm94eU1ldGhvZHMoREIsICdfZGInLCBJREJEYXRhYmFzZSwgW1xuICAgICdjbG9zZSdcbiAgXSk7XG5cbiAgLy8gQWRkIGN1cnNvciBpdGVyYXRvcnNcbiAgLy8gVE9ETzogcmVtb3ZlIHRoaXMgb25jZSBicm93c2VycyBkbyB0aGUgcmlnaHQgdGhpbmcgd2l0aCBwcm9taXNlc1xuICBbJ29wZW5DdXJzb3InLCAnb3BlbktleUN1cnNvciddLmZvckVhY2goZnVuY3Rpb24oZnVuY05hbWUpIHtcbiAgICBbT2JqZWN0U3RvcmUsIEluZGV4XS5mb3JFYWNoKGZ1bmN0aW9uKENvbnN0cnVjdG9yKSB7XG4gICAgICAvLyBEb24ndCBjcmVhdGUgaXRlcmF0ZUtleUN1cnNvciBpZiBvcGVuS2V5Q3Vyc29yIGRvZXNuJ3QgZXhpc3QuXG4gICAgICBpZiAoIShmdW5jTmFtZSBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG5cbiAgICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZVtmdW5jTmFtZS5yZXBsYWNlKCdvcGVuJywgJ2l0ZXJhdGUnKV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgICAgdmFyIG5hdGl2ZU9iamVjdCA9IHRoaXMuX3N0b3JlIHx8IHRoaXMuX2luZGV4O1xuICAgICAgICB2YXIgcmVxdWVzdCA9IG5hdGl2ZU9iamVjdFtmdW5jTmFtZV0uYXBwbHkobmF0aXZlT2JqZWN0LCBhcmdzLnNsaWNlKDAsIC0xKSk7XG4gICAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FsbGJhY2socmVxdWVzdC5yZXN1bHQpO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gcG9seWZpbGwgZ2V0QWxsXG4gIFtJbmRleCwgT2JqZWN0U3RvcmVdLmZvckVhY2goZnVuY3Rpb24oQ29uc3RydWN0b3IpIHtcbiAgICBpZiAoQ29uc3RydWN0b3IucHJvdG90eXBlLmdldEFsbCkgcmV0dXJuO1xuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihxdWVyeSwgY291bnQpIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICB2YXIgaXRlbXMgPSBbXTtcblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgaW5zdGFuY2UuaXRlcmF0ZUN1cnNvcihxdWVyeSwgZnVuY3Rpb24oY3Vyc29yKSB7XG4gICAgICAgICAgaWYgKCFjdXJzb3IpIHtcbiAgICAgICAgICAgIHJlc29sdmUoaXRlbXMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpdGVtcy5wdXNoKGN1cnNvci52YWx1ZSk7XG5cbiAgICAgICAgICBpZiAoY291bnQgIT09IHVuZGVmaW5lZCAmJiBpdGVtcy5sZW5ndGggPT0gY291bnQpIHtcbiAgICAgICAgICAgIHJlc29sdmUoaXRlbXMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcblxuICB2YXIgZXhwID0ge1xuICAgIG9wZW46IGZ1bmN0aW9uKG5hbWUsIHZlcnNpb24sIHVwZ3JhZGVDYWxsYmFjaykge1xuICAgICAgdmFyIHAgPSBwcm9taXNpZnlSZXF1ZXN0Q2FsbChpbmRleGVkREIsICdvcGVuJywgW25hbWUsIHZlcnNpb25dKTtcbiAgICAgIHZhciByZXF1ZXN0ID0gcC5yZXF1ZXN0O1xuXG4gICAgICBpZiAocmVxdWVzdCkge1xuICAgICAgICByZXF1ZXN0Lm9udXBncmFkZW5lZWRlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgaWYgKHVwZ3JhZGVDYWxsYmFjaykge1xuICAgICAgICAgICAgdXBncmFkZUNhbGxiYWNrKG5ldyBVcGdyYWRlREIocmVxdWVzdC5yZXN1bHQsIGV2ZW50Lm9sZFZlcnNpb24sIHJlcXVlc3QudHJhbnNhY3Rpb24pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwLnRoZW4oZnVuY3Rpb24oZGIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEQihkYik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGRlbGV0ZTogZnVuY3Rpb24obmFtZSkge1xuICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3RDYWxsKGluZGV4ZWREQiwgJ2RlbGV0ZURhdGFiYXNlJywgW25hbWVdKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHA7XG4gICAgbW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzO1xuICB9XG4gIGVsc2Uge1xuICAgIHNlbGYuaWRiID0gZXhwO1xuICB9XG59KCkpO1xuIl19
