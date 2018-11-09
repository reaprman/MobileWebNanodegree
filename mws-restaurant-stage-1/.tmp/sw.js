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
      console.log("SW-Review info from DB: ".concat(JSON.parse(reviews)));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc3cuanMiLCJub2RlX21vZHVsZXMvaWRiL2xpYi9pZGIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7YUNBQSxrRDtBQUNBLElBQU0sUUFBUSxHQUFHLGVBQWpCO0FBQ0EsSUFBTSxTQUFTLEdBQUcsYUFBbEI7QUFDQSxJQUFNLFlBQVksR0FBRyxTQUFyQjs7QUFFQSxJQUFNLFNBQVMsR0FBRyxhQUFJLElBQUosQ0FBUyxRQUFULEVBQW1CLENBQW5CLEVBQXNCLFVBQUEsU0FBUyxFQUFJO0FBQ25ELFVBQVEsU0FBUyxDQUFDLFVBQWxCO0FBQ0ksU0FBSyxDQUFMO0FBQ0UsTUFBQSxTQUFTLENBQUMsaUJBQVYsQ0FBNEIsU0FBNUIsRUFBdUMsRUFBRSxPQUFPLEVBQUUsSUFBWCxFQUF2QztBQUNBLFVBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxpQkFBVixDQUE0QixZQUE1QixFQUEwQyxFQUFFLE9BQU8sRUFBRSxJQUFYLEVBQTFDLENBQWxCO0FBQ0EsTUFBQSxXQUFXLENBQUMsV0FBWixDQUF3QixlQUF4QixFQUF5QyxlQUF6QyxFQUpOOzs7QUFPRCxDQVJpQixDQUFsQjs7QUFVQSxJQUFJLFFBQVEsR0FBRyxrQkFBZjs7QUFFQSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsU0FBdEIsRUFBaUMsVUFBUyxLQUFULEVBQWdCO0FBQzlDLEVBQUEsS0FBSyxDQUFDLFNBQU47QUFDTSxFQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBWixFQUFzQixJQUF0QixDQUEyQixVQUFTLEtBQVQsRUFBZ0I7QUFDekMsV0FBTyxLQUFLLENBQUMsTUFBTixDQUFhO0FBQ2pCLE9BRGlCO0FBRWpCLGlCQUZpQjtBQUdqQixzQkFIaUI7QUFJakIsb0JBSmlCO0FBS2pCLFlBTGlCO0FBTWpCLHFCQU5pQjtBQU9qQixxQkFQaUI7QUFRakIsZ0JBUmlCO0FBU2pCLGlCQVRpQjtBQVVqQiw0QkFW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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgaWRiIGZyb20gJ2lkYic7XG5jb25zdCBkYXRhYmFzZSA9ICdyZXN0YXVyYW50LWRiJztcbmNvbnN0IHN0b3JlTmFtZSA9ICdyZXN0YXVyYW50cyc7XG5jb25zdCByZXZpZXdfc3RvcmUgPSAncmV2aWV3cyc7XG5cbmNvbnN0IGRiUHJvbWlzZSA9IGlkYi5vcGVuKGRhdGFiYXNlLCAxLCB1cGdyYWRlRGIgPT4ge1xuICBzd2l0Y2ggKHVwZ3JhZGVEYi5vbGRWZXJzaW9uKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHVwZ3JhZGVEYi5jcmVhdGVPYmplY3RTdG9yZShzdG9yZU5hbWUsIHsga2V5UGF0aDogJ2lkJyB9KTtcbiAgICAgICAgbGV0IGtleVZhbFN0b3JlID0gdXBncmFkZURiLmNyZWF0ZU9iamVjdFN0b3JlKHJldmlld19zdG9yZSwgeyBrZXlwYXRoOiAnaWQnIH0pO1xuICAgICAgICBrZXlWYWxTdG9yZS5jcmVhdGVJbmRleCgncmVzdGF1cmFudF9pZCcsICdyZXN0YXVyYW50X2lkJyk7XG5cbiAgICB9XG59KTtcblxubGV0IGFwcENhY2hlID0gJ3Jlc3RhdXJhbnQtY2FjaGUnO1xuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2luc3RhbGwnLCBmdW5jdGlvbihldmVudCkge1xuICAgZXZlbnQud2FpdFVudGlsKFxuICAgICAgICAgY2FjaGVzLm9wZW4oYXBwQ2FjaGUpLnRoZW4oZnVuY3Rpb24oY2FjaGUpIHtcbiAgICAgICAgICAgcmV0dXJuIGNhY2hlLmFkZEFsbChbXG4gICAgICAgICAgICAgICcvJyxcbiAgICAgICAgICAgICAgJy9pbmRleC5odG1sJyxcbiAgICAgICAgICAgICAgJy9yZXN0YXVyYW50Lmh0bWwnLFxuICAgICAgICAgICAgICAnL21hbmlmZXN0Lmpzb24nLFxuICAgICAgICAgICAgICAnL3N3LmpzJyxcbiAgICAgICAgICAgICAgJy9jc3Mvc3R5bGVzLmNzcycsXG4gICAgICAgICAgICAgICcvanMvZGJoZWxwZXIuanMnLFxuICAgICAgICAgICAgICAnL2pzL2lkYi5qcycsXG4gICAgICAgICAgICAgICcvanMvbWFpbi5qcycsXG4gICAgICAgICAgICAgICcvanMvcmVzdGF1cmFudF9pbmZvLmpzJyxcbiAgICAgICAgICAgICAgJy9qcy9zd19yZWdpc3Rlci5qcycsXG4gICAgICAgICAgICAgICdodHRwczovL3VucGtnLmNvbS9sZWFmbGV0QDEuMy4xL2Rpc3QvbGVhZmxldC5jc3MnLFxuICAgICAgICAgICAgICAnaHR0cHM6Ly91bnBrZy5jb20vbGVhZmxldEAxLjMuMS9kaXN0L2xlYWZsZXQuanMnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FjaGUgZmFpbGVkIHRvIGxvYWQ6ICcsIGVycik7XG4gICAgICAgICB9KVxuICAgICApO1xuIH0pO1xuIFxuXG4vKlxuVG8gZGVidWcgZmV0Y2ggY29kZVxudXJsOiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS93ZWIvaWx0L3B3YS9sYWItY2FjaGluZy1maWxlcy13aXRoLXNlcnZpY2Utd29ya2VyXG5kYXRlOiAwOC8wNC8xOFxuKi9cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignZmV0Y2gnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgdXJsQ2hlY2sgPSBuZXcgVVJMKGV2ZW50LnJlcXVlc3QudXJsKTtcbiAgICAvLyBjb25zb2xlLmxvZyh1cmxDaGVjay5wb3J0KTtcbiAgICBpZiAodXJsQ2hlY2sucG9ydCA9PT0gJzEzMzcnKSB7XG4gICAgICAvL2dvIHRvIGRiIGFuZCBwdWxsIHJlc291cmNlIGlmIHRoZXJlXG4gICAgICAvL2NvbnNvbGUubG9nKCdwYXNzZWQgdXJsQ2hlY2snKTtcbiAgICAgIGhhbmRsZURhdGFiYXNlKGV2ZW50KTtcbiAgICAgIC8vZWxzZSBmZXRjaCBmcm9tIG5ldHdvcmsgbG9vayBhdCBpZGIgbGVzc29uc1xuICAgIH0gZWxzZSB7XG4gICAgICAvL29ubHkgY2FjaGUgaWYgbmVjZXNzYXJ5IGNoYW5nZXMgbmVlZGVkLi4uXG4gICAgICBldmVudC5yZXNwb25kV2l0aCggXG4gICAgICBjYWNoZXMubWF0Y2goZXZlbnQucmVxdWVzdCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlIHx8IGZldGNoKGV2ZW50LnJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIHJldHVybiBjYWNoZXMub3BlbihhcHBDYWNoZSkudGhlbihjYWNoZSA9PiB7XG4gICAgICAgICAgICBjYWNoZS5wdXQoZXZlbnQucmVxdWVzdCwgcmVzcG9uc2UuY2xvbmUoKSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGhhbmRsZVJldmlld0V2ZW50ID0gKGlkLCBldmVudCkgPT4ge1xuICAgIGV2ZW50LnJlc3BvbmRXaXRoKFxuICAgICAgZGJQcm9taXNlLnRoZW4oZGIgPT4ge1xuICAgICAgICByZXR1cm4gZGIudHJhbnNhY3Rpb24ocmV2aWV3X3N0b3JlKVxuICAgICAgICAub2JqZWN0U3RvcmUocmV2aWV3X3N0b3JlKS5pbmRleCgncmVzdGF1cmFudF9pZCcpLmdldEFsbChpZCk7XG4gICAgICB9KS50aGVuKHJldmlld3MgPT4ge1xuICAgICAgICBpZighcmV2aWV3cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYFNXLVJldmlldyBObyByZXZpZXdzIGluIGlkYmApO1xuICAgICAgICAgIHJldHVybiBmZXRjaChldmVudC5yZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgfSkudGhlbihyZXZpZXdzID0+IHtcbiAgICAgICAgICAgICByZXR1cm4gZGJQcm9taXNlLnRoZW4oZGIgPT57XG4gICAgICAgICAgICAgIGNvbnN0IHR4ID0gZGIudHJhbnNhY3Rpb24ocmV2aWV3X3N0b3JlLCAncmVhZHdyaXRlJyk7XG4gICAgICAgICAgICAgIGNvbnN0IHJldlN0b3JlID0gdHgub2JqZWN0U3RvcmUocmV2aWV3X3N0b3JlKTtcbiAgICAgICAgICAgICAgcmV2aWV3cy5mb3JFYWNoKHJldmlldyA9PiB7XG4gICAgICAgICAgICAgICAgcmV2U3RvcmUucHV0KHJldmlldywgcmV2aWV3LmlkKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiByZXZpZXdzO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBTVy1SZXZpZXcgaW5mbyBmcm9tIERCOiAke0pTT04ucGFyc2UocmV2aWV3cyl9YCk7XG4gICAgICAgICAgcmV0dXJuIHJldmlld3M7XG4gICAgICAgIH1cbiAgICAgIH0pLnRoZW4oZmluYWxSZXNwb25zZSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoZmluYWxSZXNwb25zZSkpO1xuICAgICAgfSkuY2F0Y2goZXJyb3IgPT57XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoYEVycm9yIGZldGNoaW5nIGRhdGEgJHtlcnJvcn0gJHt7c3RhdHVzOiA1MDB9fWApO1xuICAgICAgfSlcbiAgICApXG4gIH1cblxuICBjb25zdCBoYW5kbGVSZXN0YXVyYW50RXZlbnQ9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnJlc3BvbmRXaXRoKFxuICAgICAgZGJQcm9taXNlLnRoZW4oZGIgPT4ge1xuICAgICAgICByZXR1cm4gZGIudHJhbnNhY3Rpb24oc3RvcmVOYW1lKVxuICAgICAgICAub2JqZWN0U3RvcmUoc3RvcmVOYW1lKS5nZXRBbGwoKTtcbiAgICAgIH0pLnRoZW4ocmVzdGF1cmFudHMgPT4ge1xuICAgICAgICBpZiAoIXJlc3RhdXJhbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXR1cm4gZmV0Y2goZXZlbnQucmVxdWVzdCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgIH0pLnRoZW4ocmVzdGF1cmFudHMgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gZGJQcm9taXNlLnRoZW4oZGIgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB0eCA9IGRiLnRyYW5zYWN0aW9uKHN0b3JlTmFtZSwncmVhZHdyaXRlJyk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3RTdG9yZSA9IHR4Lm9iamVjdFN0b3JlKHN0b3JlTmFtZSk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhgSlNPTiBpbmZvIGZvciBEQjogJHtyZXN0YXVyYW50c31gKTtcbiAgICAgICAgICAgICAgICByZXN0YXVyYW50cy5mb3JFYWNoKHJlc3RhdXJhbnQgPT57IFxuICAgICAgICAgICAgICAgICAgcmVzdFN0b3JlLnB1dChyZXN0YXVyYW50LCByZXN0YXVyYW50LmlkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdGF1cmFudHNcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coYERBVEEgZnJvbSBEQjogJHtyZXN0YXVyYW50c31gKTtcbiAgICAgICAgICByZXR1cm4gcmVzdGF1cmFudHM7IFxuICAgICAgICB9XG4gICAgICB9KS50aGVuKGZpbmFsUmVzcG9uc2UgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KGZpbmFsUmVzcG9uc2UpKTtcbiAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShgRXJyb3IgZmV0Y2hpbmcgZGF0YSAke2Vycm9yfSAke3tzdGF0dXM6IDUwMH19YCk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBjb25zdCBoYW5kbGVEYXRhYmFzZSA9IChldmVudCkgPT4ge1xuICAgIGlmKGV2ZW50LnJlcXVlc3QubWV0aG9kICE9PSAnR0VUJykgcmV0dXJuO1xuICAgIGlmKGV2ZW50LnJlcXVlc3QudXJsLmluZGV4T2YoXCJyZXZpZXdzXCIpID4gLTEpe1xuICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChldmVudC5yZXF1ZXN0LnVybCk7XG4gICAgICBjb25zdCBpZCA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KFwicmVzdGF1cmFudF9pZFwiKSAqIDE7XG4gICAgICBoYW5kbGVSZXZpZXdFdmVudChpZCwgZXZlbnQpO1xuICAgIH1lbHNle1xuICAgICAgaGFuZGxlUmVzdGF1cmFudEV2ZW50KGV2ZW50KTtcbiAgICB9XG4gIH0iLCIndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gdG9BcnJheShhcnIpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlcXVlc3Qub25zdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXN1bHQpO1xuICAgICAgfTtcblxuICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncykge1xuICAgIHZhciByZXF1ZXN0O1xuICAgIHZhciBwID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZXF1ZXN0ID0gb2JqW21ldGhvZF0uYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuXG4gICAgcC5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb21pc2lmeUN1cnNvclJlcXVlc3RDYWxsKG9iaiwgbWV0aG9kLCBhcmdzKSB7XG4gICAgdmFyIHAgPSBwcm9taXNpZnlSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncyk7XG4gICAgcmV0dXJuIHAudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgcmV0dXJuIG5ldyBDdXJzb3IodmFsdWUsIHAucmVxdWVzdCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eVByb3BlcnRpZXMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUHJveHlDbGFzcy5wcm90b3R5cGUsIHByb3AsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc1t0YXJnZXRQcm9wXVtwcm9wXTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICB0aGlzW3RhcmdldFByb3BdW3Byb3BdID0gdmFsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5UmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eU1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpc1t0YXJnZXRQcm9wXVtwcm9wXS5hcHBseSh0aGlzW3RhcmdldFByb3BdLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5Q3Vyc29yUmVxdWVzdE1ldGhvZHMoUHJveHlDbGFzcywgdGFyZ2V0UHJvcCwgQ29uc3RydWN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgaWYgKCEocHJvcCBpbiBDb25zdHJ1Y3Rvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgICBQcm94eUNsYXNzLnByb3RvdHlwZVtwcm9wXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5Q3Vyc29yUmVxdWVzdENhbGwodGhpc1t0YXJnZXRQcm9wXSwgcHJvcCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBJbmRleChpbmRleCkge1xuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG4gIH1cblxuICBwcm94eVByb3BlcnRpZXMoSW5kZXgsICdfaW5kZXgnLCBbXG4gICAgJ25hbWUnLFxuICAgICdrZXlQYXRoJyxcbiAgICAnbXVsdGlFbnRyeScsXG4gICAgJ3VuaXF1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ2dldCcsXG4gICAgJ2dldEtleScsXG4gICAgJ2dldEFsbCcsXG4gICAgJ2dldEFsbEtleXMnLFxuICAgICdjb3VudCdcbiAgXSk7XG5cbiAgcHJveHlDdXJzb3JSZXF1ZXN0TWV0aG9kcyhJbmRleCwgJ19pbmRleCcsIElEQkluZGV4LCBbXG4gICAgJ29wZW5DdXJzb3InLFxuICAgICdvcGVuS2V5Q3Vyc29yJ1xuICBdKTtcblxuICBmdW5jdGlvbiBDdXJzb3IoY3Vyc29yLCByZXF1ZXN0KSB7XG4gICAgdGhpcy5fY3Vyc29yID0gY3Vyc29yO1xuICAgIHRoaXMuX3JlcXVlc3QgPSByZXF1ZXN0O1xuICB9XG5cbiAgcHJveHlQcm9wZXJ0aWVzKEN1cnNvciwgJ19jdXJzb3InLCBbXG4gICAgJ2RpcmVjdGlvbicsXG4gICAgJ2tleScsXG4gICAgJ3ByaW1hcnlLZXknLFxuICAgICd2YWx1ZSdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhDdXJzb3IsICdfY3Vyc29yJywgSURCQ3Vyc29yLCBbXG4gICAgJ3VwZGF0ZScsXG4gICAgJ2RlbGV0ZSdcbiAgXSk7XG5cbiAgLy8gcHJveHkgJ25leHQnIG1ldGhvZHNcbiAgWydhZHZhbmNlJywgJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleSddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgIGlmICghKG1ldGhvZE5hbWUgaW4gSURCQ3Vyc29yLnByb3RvdHlwZSkpIHJldHVybjtcbiAgICBDdXJzb3IucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3Vyc29yID0gdGhpcztcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGN1cnNvci5fY3Vyc29yW21ldGhvZE5hbWVdLmFwcGx5KGN1cnNvci5fY3Vyc29yLCBhcmdzKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QoY3Vyc29yLl9yZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuICAgICAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHZhbHVlLCBjdXJzb3IuX3JlcXVlc3QpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIE9iamVjdFN0b3JlKHN0b3JlKSB7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgfVxuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5jcmVhdGVJbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuY3JlYXRlSW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIE9iamVjdFN0b3JlLnByb3RvdHlwZS5pbmRleCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgSW5kZXgodGhpcy5fc3RvcmUuaW5kZXguYXBwbHkodGhpcy5fc3RvcmUsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIHByb3h5UHJvcGVydGllcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIFtcbiAgICAnbmFtZScsXG4gICAgJ2tleVBhdGgnLFxuICAgICdpbmRleE5hbWVzJyxcbiAgICAnYXV0b0luY3JlbWVudCdcbiAgXSk7XG5cbiAgcHJveHlSZXF1ZXN0TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ3B1dCcsXG4gICAgJ2FkZCcsXG4gICAgJ2RlbGV0ZScsXG4gICAgJ2NsZWFyJyxcbiAgICAnZ2V0JyxcbiAgICAnZ2V0QWxsJyxcbiAgICAnZ2V0S2V5JyxcbiAgICAnZ2V0QWxsS2V5cycsXG4gICAgJ2NvdW50J1xuICBdKTtcblxuICBwcm94eUN1cnNvclJlcXVlc3RNZXRob2RzKE9iamVjdFN0b3JlLCAnX3N0b3JlJywgSURCT2JqZWN0U3RvcmUsIFtcbiAgICAnb3BlbkN1cnNvcicsXG4gICAgJ29wZW5LZXlDdXJzb3InXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ2RlbGV0ZUluZGV4J1xuICBdKTtcblxuICBmdW5jdGlvbiBUcmFuc2FjdGlvbihpZGJUcmFuc2FjdGlvbikge1xuICAgIHRoaXMuX3R4ID0gaWRiVHJhbnNhY3Rpb247XG4gICAgdGhpcy5jb21wbGV0ZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuICAgICAgaWRiVHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QoaWRiVHJhbnNhY3Rpb24uZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIGlkYlRyYW5zYWN0aW9uLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KGlkYlRyYW5zYWN0aW9uLmVycm9yKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBUcmFuc2FjdGlvbi5wcm90b3R5cGUub2JqZWN0U3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE9iamVjdFN0b3JlKHRoaXMuX3R4Lm9iamVjdFN0b3JlLmFwcGx5KHRoaXMuX3R4LCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoVHJhbnNhY3Rpb24sICdfdHgnLCBbXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnLFxuICAgICdtb2RlJ1xuICBdKTtcblxuICBwcm94eU1ldGhvZHMoVHJhbnNhY3Rpb24sICdfdHgnLCBJREJUcmFuc2FjdGlvbiwgW1xuICAgICdhYm9ydCdcbiAgXSk7XG5cbiAgZnVuY3Rpb24gVXBncmFkZURCKGRiLCBvbGRWZXJzaW9uLCB0cmFuc2FjdGlvbikge1xuICAgIHRoaXMuX2RiID0gZGI7XG4gICAgdGhpcy5vbGRWZXJzaW9uID0gb2xkVmVyc2lvbjtcbiAgICB0aGlzLnRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uKTtcbiAgfVxuXG4gIFVwZ3JhZGVEQi5wcm90b3R5cGUuY3JlYXRlT2JqZWN0U3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IE9iamVjdFN0b3JlKHRoaXMuX2RiLmNyZWF0ZU9iamVjdFN0b3JlLmFwcGx5KHRoaXMuX2RiLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoVXBncmFkZURCLCAnX2RiJywgW1xuICAgICduYW1lJyxcbiAgICAndmVyc2lvbicsXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhVcGdyYWRlREIsICdfZGInLCBJREJEYXRhYmFzZSwgW1xuICAgICdkZWxldGVPYmplY3RTdG9yZScsXG4gICAgJ2Nsb3NlJ1xuICBdKTtcblxuICBmdW5jdGlvbiBEQihkYikge1xuICAgIHRoaXMuX2RiID0gZGI7XG4gIH1cblxuICBEQi5wcm90b3R5cGUudHJhbnNhY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFRyYW5zYWN0aW9uKHRoaXMuX2RiLnRyYW5zYWN0aW9uLmFwcGx5KHRoaXMuX2RiLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoREIsICdfZGInLCBbXG4gICAgJ25hbWUnLFxuICAgICd2ZXJzaW9uJyxcbiAgICAnb2JqZWN0U3RvcmVOYW1lcydcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKERCLCAnX2RiJywgSURCRGF0YWJhc2UsIFtcbiAgICAnY2xvc2UnXG4gIF0pO1xuXG4gIC8vIEFkZCBjdXJzb3IgaXRlcmF0b3JzXG4gIC8vIFRPRE86IHJlbW92ZSB0aGlzIG9uY2UgYnJvd3NlcnMgZG8gdGhlIHJpZ2h0IHRoaW5nIHdpdGggcHJvbWlzZXNcbiAgWydvcGVuQ3Vyc29yJywgJ29wZW5LZXlDdXJzb3InXS5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmNOYW1lKSB7XG4gICAgW09iamVjdFN0b3JlLCBJbmRleF0uZm9yRWFjaChmdW5jdGlvbihDb25zdHJ1Y3Rvcikge1xuICAgICAgLy8gRG9uJ3QgY3JlYXRlIGl0ZXJhdGVLZXlDdXJzb3IgaWYgb3BlbktleUN1cnNvciBkb2Vzbid0IGV4aXN0LlxuICAgICAgaWYgKCEoZnVuY05hbWUgaW4gQ29uc3RydWN0b3IucHJvdG90eXBlKSkgcmV0dXJuO1xuXG4gICAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGVbZnVuY05hbWUucmVwbGFjZSgnb3BlbicsICdpdGVyYXRlJyldID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMpO1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgIHZhciBuYXRpdmVPYmplY3QgPSB0aGlzLl9zdG9yZSB8fCB0aGlzLl9pbmRleDtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuYXRpdmVPYmplY3RbZnVuY05hbWVdLmFwcGx5KG5hdGl2ZU9iamVjdCwgYXJncy5zbGljZSgwLCAtMSkpO1xuICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbGxiYWNrKHJlcXVlc3QucmVzdWx0KTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIHBvbHlmaWxsIGdldEFsbFxuICBbSW5kZXgsIE9iamVjdFN0b3JlXS5mb3JFYWNoKGZ1bmN0aW9uKENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKENvbnN0cnVjdG9yLnByb3RvdHlwZS5nZXRBbGwpIHJldHVybjtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24ocXVlcnksIGNvdW50KSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIGluc3RhbmNlLml0ZXJhdGVDdXJzb3IocXVlcnksIGZ1bmN0aW9uKGN1cnNvcikge1xuICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXRlbXMucHVzaChjdXJzb3IudmFsdWUpO1xuXG4gICAgICAgICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQgJiYgaXRlbXMubGVuZ3RoID09IGNvdW50KSB7XG4gICAgICAgICAgICByZXNvbHZlKGl0ZW1zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgdmFyIGV4cCA9IHtcbiAgICBvcGVuOiBmdW5jdGlvbihuYW1lLCB2ZXJzaW9uLCB1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgIHZhciBwID0gcHJvbWlzaWZ5UmVxdWVzdENhbGwoaW5kZXhlZERCLCAnb3BlbicsIFtuYW1lLCB2ZXJzaW9uXSk7XG4gICAgICB2YXIgcmVxdWVzdCA9IHAucmVxdWVzdDtcblxuICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgcmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGlmICh1cGdyYWRlQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIHVwZ3JhZGVDYWxsYmFjayhuZXcgVXBncmFkZURCKHJlcXVlc3QucmVzdWx0LCBldmVudC5vbGRWZXJzaW9uLCByZXF1ZXN0LnRyYW5zYWN0aW9uKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcC50aGVuKGZ1bmN0aW9uKGRiKSB7XG4gICAgICAgIHJldHVybiBuZXcgREIoZGIpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWxldGU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0Q2FsbChpbmRleGVkREIsICdkZWxldGVEYXRhYmFzZScsIFtuYW1lXSk7XG4gICAgfVxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwO1xuICAgIG1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBtb2R1bGUuZXhwb3J0cztcbiAgfVxuICBlbHNlIHtcbiAgICBzZWxmLmlkYiA9IGV4cDtcbiAgfVxufSgpKTtcbiJdfQ==
