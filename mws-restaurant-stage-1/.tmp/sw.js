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
    console.log("SW-Review info from DB: ".concat(reviews));
    if (!reviews.length > 0) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc3cuanMiLCJub2RlX21vZHVsZXMvaWRiL2xpYi9pZGIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7YUNBQSxrRDtBQUNBLElBQU0sUUFBUSxHQUFHLGVBQWpCO0FBQ0EsSUFBTSxTQUFTLEdBQUcsYUFBbEI7QUFDQSxJQUFNLFlBQVksR0FBRyxTQUFyQjs7QUFFQSxJQUFNLFNBQVMsR0FBRyxhQUFJLElBQUosQ0FBUyxRQUFULEVBQW1CLENBQW5CLEVBQXNCLFVBQUEsU0FBUyxFQUFJO0FBQ25ELFVBQVEsU0FBUyxDQUFDLFVBQWxCO0FBQ0ksU0FBSyxDQUFMO0FBQ0UsTUFBQSxTQUFTLENBQUMsaUJBQVYsQ0FBNEIsU0FBNUIsRUFBdUMsRUFBRSxPQUFPLEVBQUUsSUFBWCxFQUF2QztBQUNBLFVBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxpQkFBVixDQUE0QixZQUE1QixFQUEwQyxFQUFFLE9BQU8sRUFBRSxJQUFYLEVBQTFDLENBQWxCO0FBQ0EsTUFBQSxXQUFXLENBQUMsV0FBWixDQUF3QixlQUF4QixFQUF5QyxlQUF6QyxFQUpOOzs7QUFPRCxDQVJpQixDQUFsQjs7QUFVQSxJQUFJLFFBQVEsR0FBRyxrQkFBZjs7QUFFQSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsU0FBdEIsRUFBaUMsVUFBUyxLQUFULEVBQWdCO0FBQzlDLEVBQUEsS0FBSyxDQUFDLFNBQU47QUFDTSxFQUFBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBWixFQUFzQixJQUF0QixDQUEyQixVQUFTLEtBQVQsRUFBZ0I7QUFDekMsV0FBTyxLQUFLLENBQUMsTUFBTixDQUFhO0FBQ2pCLE9BRGlCO0FBRWpCLGlCQUZpQjtBQUdqQixzQkFIaUI7QUFJakIsb0JBSmlCO0FBS2pCLFlBTGlCO0FBTWpCLHFCQU5pQjtBQU9qQixxQkFQaUI7QUFRakIsZ0JBUmlCO0FBU2pCLGlCQVRpQjtBQVVqQiw0QkFW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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IGlkYiBmcm9tICdpZGInO1xuY29uc3QgZGF0YWJhc2UgPSAncmVzdGF1cmFudC1kYic7XG5jb25zdCBzdG9yZU5hbWUgPSAncmVzdGF1cmFudHMnO1xuY29uc3QgcmV2aWV3X3N0b3JlID0gJ3Jldmlld3MnO1xuXG5jb25zdCBkYlByb21pc2UgPSBpZGIub3BlbihkYXRhYmFzZSwgMSwgdXBncmFkZURiID0+IHtcbiAgc3dpdGNoICh1cGdyYWRlRGIub2xkVmVyc2lvbikge1xuICAgICAgY2FzZSAwOlxuICAgICAgICB1cGdyYWRlRGIuY3JlYXRlT2JqZWN0U3RvcmUoc3RvcmVOYW1lLCB7IGtleVBhdGg6ICdpZCcgfSk7XG4gICAgICAgIGxldCBrZXlWYWxTdG9yZSA9IHVwZ3JhZGVEYi5jcmVhdGVPYmplY3RTdG9yZShyZXZpZXdfc3RvcmUsIHsga2V5cGF0aDogJ2lkJyB9KTtcbiAgICAgICAga2V5VmFsU3RvcmUuY3JlYXRlSW5kZXgoJ3Jlc3RhdXJhbnRfaWQnLCAncmVzdGF1cmFudF9pZCcpO1xuXG4gICAgfVxufSk7XG5cbmxldCBhcHBDYWNoZSA9ICdyZXN0YXVyYW50LWNhY2hlJztcblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdpbnN0YWxsJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgIGV2ZW50LndhaXRVbnRpbChcbiAgICAgICAgIGNhY2hlcy5vcGVuKGFwcENhY2hlKS50aGVuKGZ1bmN0aW9uKGNhY2hlKSB7XG4gICAgICAgICAgIHJldHVybiBjYWNoZS5hZGRBbGwoW1xuICAgICAgICAgICAgICAnLycsXG4gICAgICAgICAgICAgICcvaW5kZXguaHRtbCcsXG4gICAgICAgICAgICAgICcvcmVzdGF1cmFudC5odG1sJyxcbiAgICAgICAgICAgICAgJy9tYW5pZmVzdC5qc29uJyxcbiAgICAgICAgICAgICAgJy9zdy5qcycsXG4gICAgICAgICAgICAgICcvY3NzL3N0eWxlcy5jc3MnLFxuICAgICAgICAgICAgICAnL2pzL2RiaGVscGVyLmpzJyxcbiAgICAgICAgICAgICAgJy9qcy9pZGIuanMnLFxuICAgICAgICAgICAgICAnL2pzL21haW4uanMnLFxuICAgICAgICAgICAgICAnL2pzL3Jlc3RhdXJhbnRfaW5mby5qcycsXG4gICAgICAgICAgICAgICcvanMvc3dfcmVnaXN0ZXIuanMnLFxuICAgICAgICAgICAgICAnaHR0cHM6Ly91bnBrZy5jb20vbGVhZmxldEAxLjMuMS9kaXN0L2xlYWZsZXQuY3NzJyxcbiAgICAgICAgICAgICAgJ2h0dHBzOi8vdW5wa2cuY29tL2xlYWZsZXRAMS4zLjEvZGlzdC9sZWFmbGV0LmpzJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgY29uc29sZS5sb2coJ0NhY2hlIGZhaWxlZCB0byBsb2FkOiAnLCBlcnIpO1xuICAgICAgICAgfSlcbiAgICAgKTtcbiB9KTtcbiBcblxuLypcblRvIGRlYnVnIGZldGNoIGNvZGVcbnVybDogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vd2ViL2lsdC9wd2EvbGFiLWNhY2hpbmctZmlsZXMtd2l0aC1zZXJ2aWNlLXdvcmtlclxuZGF0ZTogMDgvMDQvMThcbiovXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ2ZldGNoJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIHVybENoZWNrID0gbmV3IFVSTChldmVudC5yZXF1ZXN0LnVybCk7XG4gICAgLy8gY29uc29sZS5sb2codXJsQ2hlY2sucG9ydCk7XG4gICAgaWYgKHVybENoZWNrLnBvcnQgPT09ICcxMzM3Jykge1xuICAgICAgLy9nbyB0byBkYiBhbmQgcHVsbCByZXNvdXJjZSBpZiB0aGVyZVxuICAgICAgLy9jb25zb2xlLmxvZygncGFzc2VkIHVybENoZWNrJyk7XG4gICAgICBoYW5kbGVEYXRhYmFzZShldmVudCk7XG4gICAgICAvL2Vsc2UgZmV0Y2ggZnJvbSBuZXR3b3JrIGxvb2sgYXQgaWRiIGxlc3NvbnNcbiAgICB9IGVsc2Uge1xuICAgICAgLy9vbmx5IGNhY2hlIGlmIG5lY2Vzc2FyeSBjaGFuZ2VzIG5lZWRlZC4uLlxuICAgICAgZXZlbnQucmVzcG9uZFdpdGgoIFxuICAgICAgY2FjaGVzLm1hdGNoKGV2ZW50LnJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZSB8fCBmZXRjaChldmVudC5yZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICByZXR1cm4gY2FjaGVzLm9wZW4oYXBwQ2FjaGUpLnRoZW4oY2FjaGUgPT4ge1xuICAgICAgICAgICAgY2FjaGUucHV0KGV2ZW50LnJlcXVlc3QsIHJlc3BvbnNlLmNsb25lKCkpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KSk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBoYW5kbGVSZXZpZXdFdmVudCA9IChpZCwgZXZlbnQpID0+IHtcbiAgICBldmVudC5yZXNwb25kV2l0aChcbiAgICAgIGRiUHJvbWlzZS50aGVuKGRiID0+IHtcbiAgICAgICAgcmV0dXJuIGRiLnRyYW5zYWN0aW9uKHJldmlld19zdG9yZSlcbiAgICAgICAgLm9iamVjdFN0b3JlKHJldmlld19zdG9yZSkuaW5kZXgoJ3Jlc3RhdXJhbnRfaWQnKS5nZXRBbGwoaWQpO1xuICAgICAgfSkudGhlbihyZXZpZXdzID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFNXLVJldmlldyBpbmZvIGZyb20gREI6ICR7cmV2aWV3c31gKTtcbiAgICAgICAgaWYoIXJldmlld3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiBmZXRjaChldmVudC5yZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgfSkudGhlbihyZXZpZXdzID0+IHtcbiAgICAgICAgICAgICByZXR1cm4gZGJQcm9taXNlLnRoZW4oZGIgPT57XG4gICAgICAgICAgICAgIGNvbnN0IHR4ID0gZGIudHJhbnNhY3Rpb24ocmV2aWV3X3N0b3JlLCAncmVhZHdyaXRlJyk7XG4gICAgICAgICAgICAgIGNvbnN0IHJldlN0b3JlID0gdHgub2JqZWN0U3RvcmUocmV2aWV3X3N0b3JlKTtcbiAgICAgICAgICAgICAgcmV2aWV3cy5mb3JFYWNoKHJldmlldyA9PiB7XG4gICAgICAgICAgICAgICAgcmV2U3RvcmUucHV0KHJldmlldywgcmV2aWV3LmlkKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiByZXZpZXdzO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJldHVybiByZXZpZXdzO1xuICAgICAgICB9XG4gICAgICB9KS50aGVuKGZpbmFsUmVzcG9uc2UgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KGZpbmFsUmVzcG9uc2UpKTtcbiAgICAgIH0pLmNhdGNoKGVycm9yID0+e1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGBFcnJvciBmZXRjaGluZyBkYXRhICR7ZXJyb3J9ICR7e3N0YXR1czogNTAwfX1gKTtcbiAgICAgIH0pXG4gICAgKVxuICB9XG5cbiAgY29uc3QgaGFuZGxlUmVzdGF1cmFudEV2ZW50PSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5yZXNwb25kV2l0aChcbiAgICAgIGRiUHJvbWlzZS50aGVuKGRiID0+IHtcbiAgICAgICAgcmV0dXJuIGRiLnRyYW5zYWN0aW9uKHN0b3JlTmFtZSlcbiAgICAgICAgLm9iamVjdFN0b3JlKHN0b3JlTmFtZSkuZ2V0QWxsKCk7XG4gICAgICB9KS50aGVuKHJlc3RhdXJhbnRzID0+IHtcbiAgICAgICAgaWYgKCFyZXN0YXVyYW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZldGNoKGV2ZW50LnJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICB9KS50aGVuKHJlc3RhdXJhbnRzID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRiUHJvbWlzZS50aGVuKGRiID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdHggPSBkYi50cmFuc2FjdGlvbihzdG9yZU5hbWUsJ3JlYWR3cml0ZScpO1xuICAgICAgICAgICAgICAgIGxldCByZXN0U3RvcmUgPSB0eC5vYmplY3RTdG9yZShzdG9yZU5hbWUpO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYEpTT04gaW5mbyBmb3IgREI6ICR7cmVzdGF1cmFudHN9YCk7XG4gICAgICAgICAgICAgICAgcmVzdGF1cmFudHMuZm9yRWFjaChyZXN0YXVyYW50ID0+eyBcbiAgICAgICAgICAgICAgICAgIHJlc3RTdG9yZS5wdXQocmVzdGF1cmFudCwgcmVzdGF1cmFudC5pZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3RhdXJhbnRzXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGBEQVRBIGZyb20gREI6ICR7cmVzdGF1cmFudHN9YCk7XG4gICAgICAgICAgcmV0dXJuIHJlc3RhdXJhbnRzOyBcbiAgICAgICAgfVxuICAgICAgfSkudGhlbihmaW5hbFJlc3BvbnNlID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShmaW5hbFJlc3BvbnNlKSk7XG4gICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoYEVycm9yIGZldGNoaW5nIGRhdGEgJHtlcnJvcn0gJHt7c3RhdHVzOiA1MDB9fWApO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgY29uc3QgaGFuZGxlRGF0YWJhc2UgPSAoZXZlbnQpID0+IHtcbiAgICBpZihldmVudC5yZXF1ZXN0LnVybC5pbmRleE9mKFwicmV2aWV3c1wiKSA+IC0xKXtcbiAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoZXZlbnQucmVxdWVzdC51cmwpO1xuICAgICAgY29uc3QgaWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldChcInJlc3RhdXJhbnRfaWRcIikgKiAxO1xuICAgICAgaGFuZGxlUmV2aWV3RXZlbnQoaWQsIGV2ZW50KTtcbiAgICB9ZWxzZXtcbiAgICAgIGhhbmRsZVJlc3RhdXJhbnRFdmVudChldmVudCk7XG4gICAgfVxuICB9IiwiJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIHRvQXJyYXkoYXJyKSB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycik7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlcXVlc3QucmVzdWx0KTtcbiAgICAgIH07XG5cbiAgICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvbWlzaWZ5UmVxdWVzdENhbGwob2JqLCBtZXRob2QsIGFyZ3MpIHtcbiAgICB2YXIgcmVxdWVzdDtcbiAgICB2YXIgcCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVxdWVzdCA9IG9ialttZXRob2RdLmFwcGx5KG9iaiwgYXJncyk7XG4gICAgICBwcm9taXNpZnlSZXF1ZXN0KHJlcXVlc3QpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcblxuICAgIHAucmVxdWVzdCA9IHJlcXVlc3Q7XG4gICAgcmV0dXJuIHA7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9taXNpZnlDdXJzb3JSZXF1ZXN0Q2FsbChvYmosIG1ldGhvZCwgYXJncykge1xuICAgIHZhciBwID0gcHJvbWlzaWZ5UmVxdWVzdENhbGwob2JqLCBtZXRob2QsIGFyZ3MpO1xuICAgIHJldHVybiBwLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghdmFsdWUpIHJldHVybjtcbiAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHZhbHVlLCBwLnJlcXVlc3QpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJveHlQcm9wZXJ0aWVzKFByb3h5Q2xhc3MsIHRhcmdldFByb3AsIHByb3BlcnRpZXMpIHtcbiAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcCkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFByb3h5Q2xhc3MucHJvdG90eXBlLCBwcm9wLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbdGFyZ2V0UHJvcF1bcHJvcF07XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgdGhpc1t0YXJnZXRQcm9wXVtwcm9wXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eVJlcXVlc3RNZXRob2RzKFByb3h5Q2xhc3MsIHRhcmdldFByb3AsIENvbnN0cnVjdG9yLCBwcm9wZXJ0aWVzKSB7XG4gICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIGlmICghKHByb3AgaW4gQ29uc3RydWN0b3IucHJvdG90eXBlKSkgcmV0dXJuO1xuICAgICAgUHJveHlDbGFzcy5wcm90b3R5cGVbcHJvcF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3RDYWxsKHRoaXNbdGFyZ2V0UHJvcF0sIHByb3AsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJveHlNZXRob2RzKFByb3h5Q2xhc3MsIHRhcmdldFByb3AsIENvbnN0cnVjdG9yLCBwcm9wZXJ0aWVzKSB7XG4gICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIGlmICghKHByb3AgaW4gQ29uc3RydWN0b3IucHJvdG90eXBlKSkgcmV0dXJuO1xuICAgICAgUHJveHlDbGFzcy5wcm90b3R5cGVbcHJvcF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbdGFyZ2V0UHJvcF1bcHJvcF0uYXBwbHkodGhpc1t0YXJnZXRQcm9wXSwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwcm94eUN1cnNvclJlcXVlc3RNZXRob2RzKFByb3h5Q2xhc3MsIHRhcmdldFByb3AsIENvbnN0cnVjdG9yLCBwcm9wZXJ0aWVzKSB7XG4gICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgIGlmICghKHByb3AgaW4gQ29uc3RydWN0b3IucHJvdG90eXBlKSkgcmV0dXJuO1xuICAgICAgUHJveHlDbGFzcy5wcm90b3R5cGVbcHJvcF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeUN1cnNvclJlcXVlc3RDYWxsKHRoaXNbdGFyZ2V0UHJvcF0sIHByb3AsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gSW5kZXgoaW5kZXgpIHtcbiAgICB0aGlzLl9pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgcHJveHlQcm9wZXJ0aWVzKEluZGV4LCAnX2luZGV4JywgW1xuICAgICduYW1lJyxcbiAgICAna2V5UGF0aCcsXG4gICAgJ211bHRpRW50cnknLFxuICAgICd1bmlxdWUnXG4gIF0pO1xuXG4gIHByb3h5UmVxdWVzdE1ldGhvZHMoSW5kZXgsICdfaW5kZXgnLCBJREJJbmRleCwgW1xuICAgICdnZXQnLFxuICAgICdnZXRLZXknLFxuICAgICdnZXRBbGwnLFxuICAgICdnZXRBbGxLZXlzJyxcbiAgICAnY291bnQnXG4gIF0pO1xuXG4gIHByb3h5Q3Vyc29yUmVxdWVzdE1ldGhvZHMoSW5kZXgsICdfaW5kZXgnLCBJREJJbmRleCwgW1xuICAgICdvcGVuQ3Vyc29yJyxcbiAgICAnb3BlbktleUN1cnNvcidcbiAgXSk7XG5cbiAgZnVuY3Rpb24gQ3Vyc29yKGN1cnNvciwgcmVxdWVzdCkge1xuICAgIHRoaXMuX2N1cnNvciA9IGN1cnNvcjtcbiAgICB0aGlzLl9yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgfVxuXG4gIHByb3h5UHJvcGVydGllcyhDdXJzb3IsICdfY3Vyc29yJywgW1xuICAgICdkaXJlY3Rpb24nLFxuICAgICdrZXknLFxuICAgICdwcmltYXJ5S2V5JyxcbiAgICAndmFsdWUnXG4gIF0pO1xuXG4gIHByb3h5UmVxdWVzdE1ldGhvZHMoQ3Vyc29yLCAnX2N1cnNvcicsIElEQkN1cnNvciwgW1xuICAgICd1cGRhdGUnLFxuICAgICdkZWxldGUnXG4gIF0pO1xuXG4gIC8vIHByb3h5ICduZXh0JyBtZXRob2RzXG4gIFsnYWR2YW5jZScsICdjb250aW51ZScsICdjb250aW51ZVByaW1hcnlLZXknXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICBpZiAoIShtZXRob2ROYW1lIGluIElEQkN1cnNvci5wcm90b3R5cGUpKSByZXR1cm47XG4gICAgQ3Vyc29yLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN1cnNvciA9IHRoaXM7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBjdXJzb3IuX2N1cnNvclttZXRob2ROYW1lXS5hcHBseShjdXJzb3IuX2N1cnNvciwgYXJncyk7XG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0KGN1cnNvci5fcmVxdWVzdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmICghdmFsdWUpIHJldHVybjtcbiAgICAgICAgICByZXR1cm4gbmV3IEN1cnNvcih2YWx1ZSwgY3Vyc29yLl9yZXF1ZXN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcblxuICBmdW5jdGlvbiBPYmplY3RTdG9yZShzdG9yZSkge1xuICAgIHRoaXMuX3N0b3JlID0gc3RvcmU7XG4gIH1cblxuICBPYmplY3RTdG9yZS5wcm90b3R5cGUuY3JlYXRlSW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEluZGV4KHRoaXMuX3N0b3JlLmNyZWF0ZUluZGV4LmFwcGx5KHRoaXMuX3N0b3JlLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBPYmplY3RTdG9yZS5wcm90b3R5cGUuaW5kZXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IEluZGV4KHRoaXMuX3N0b3JlLmluZGV4LmFwcGx5KHRoaXMuX3N0b3JlLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBwcm94eVByb3BlcnRpZXMoT2JqZWN0U3RvcmUsICdfc3RvcmUnLCBbXG4gICAgJ25hbWUnLFxuICAgICdrZXlQYXRoJyxcbiAgICAnaW5kZXhOYW1lcycsXG4gICAgJ2F1dG9JbmNyZW1lbnQnXG4gIF0pO1xuXG4gIHByb3h5UmVxdWVzdE1ldGhvZHMoT2JqZWN0U3RvcmUsICdfc3RvcmUnLCBJREJPYmplY3RTdG9yZSwgW1xuICAgICdwdXQnLFxuICAgICdhZGQnLFxuICAgICdkZWxldGUnLFxuICAgICdjbGVhcicsXG4gICAgJ2dldCcsXG4gICAgJ2dldEFsbCcsXG4gICAgJ2dldEtleScsXG4gICAgJ2dldEFsbEtleXMnLFxuICAgICdjb3VudCdcbiAgXSk7XG5cbiAgcHJveHlDdXJzb3JSZXF1ZXN0TWV0aG9kcyhPYmplY3RTdG9yZSwgJ19zdG9yZScsIElEQk9iamVjdFN0b3JlLCBbXG4gICAgJ29wZW5DdXJzb3InLFxuICAgICdvcGVuS2V5Q3Vyc29yJ1xuICBdKTtcblxuICBwcm94eU1ldGhvZHMoT2JqZWN0U3RvcmUsICdfc3RvcmUnLCBJREJPYmplY3RTdG9yZSwgW1xuICAgICdkZWxldGVJbmRleCdcbiAgXSk7XG5cbiAgZnVuY3Rpb24gVHJhbnNhY3Rpb24oaWRiVHJhbnNhY3Rpb24pIHtcbiAgICB0aGlzLl90eCA9IGlkYlRyYW5zYWN0aW9uO1xuICAgIHRoaXMuY29tcGxldGUgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlkYlRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfTtcbiAgICAgIGlkYlRyYW5zYWN0aW9uLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KGlkYlRyYW5zYWN0aW9uLmVycm9yKTtcbiAgICAgIH07XG4gICAgICBpZGJUcmFuc2FjdGlvbi5vbmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChpZGJUcmFuc2FjdGlvbi5lcnJvcik7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgVHJhbnNhY3Rpb24ucHJvdG90eXBlLm9iamVjdFN0b3JlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBPYmplY3RTdG9yZSh0aGlzLl90eC5vYmplY3RTdG9yZS5hcHBseSh0aGlzLl90eCwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgcHJveHlQcm9wZXJ0aWVzKFRyYW5zYWN0aW9uLCAnX3R4JywgW1xuICAgICdvYmplY3RTdG9yZU5hbWVzJyxcbiAgICAnbW9kZSdcbiAgXSk7XG5cbiAgcHJveHlNZXRob2RzKFRyYW5zYWN0aW9uLCAnX3R4JywgSURCVHJhbnNhY3Rpb24sIFtcbiAgICAnYWJvcnQnXG4gIF0pO1xuXG4gIGZ1bmN0aW9uIFVwZ3JhZGVEQihkYiwgb2xkVmVyc2lvbiwgdHJhbnNhY3Rpb24pIHtcbiAgICB0aGlzLl9kYiA9IGRiO1xuICAgIHRoaXMub2xkVmVyc2lvbiA9IG9sZFZlcnNpb247XG4gICAgdGhpcy50cmFuc2FjdGlvbiA9IG5ldyBUcmFuc2FjdGlvbih0cmFuc2FjdGlvbik7XG4gIH1cblxuICBVcGdyYWRlREIucHJvdG90eXBlLmNyZWF0ZU9iamVjdFN0b3JlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBPYmplY3RTdG9yZSh0aGlzLl9kYi5jcmVhdGVPYmplY3RTdG9yZS5hcHBseSh0aGlzLl9kYiwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgcHJveHlQcm9wZXJ0aWVzKFVwZ3JhZGVEQiwgJ19kYicsIFtcbiAgICAnbmFtZScsXG4gICAgJ3ZlcnNpb24nLFxuICAgICdvYmplY3RTdG9yZU5hbWVzJ1xuICBdKTtcblxuICBwcm94eU1ldGhvZHMoVXBncmFkZURCLCAnX2RiJywgSURCRGF0YWJhc2UsIFtcbiAgICAnZGVsZXRlT2JqZWN0U3RvcmUnLFxuICAgICdjbG9zZSdcbiAgXSk7XG5cbiAgZnVuY3Rpb24gREIoZGIpIHtcbiAgICB0aGlzLl9kYiA9IGRiO1xuICB9XG5cbiAgREIucHJvdG90eXBlLnRyYW5zYWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBUcmFuc2FjdGlvbih0aGlzLl9kYi50cmFuc2FjdGlvbi5hcHBseSh0aGlzLl9kYiwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgcHJveHlQcm9wZXJ0aWVzKERCLCAnX2RiJywgW1xuICAgICduYW1lJyxcbiAgICAndmVyc2lvbicsXG4gICAgJ29iamVjdFN0b3JlTmFtZXMnXG4gIF0pO1xuXG4gIHByb3h5TWV0aG9kcyhEQiwgJ19kYicsIElEQkRhdGFiYXNlLCBbXG4gICAgJ2Nsb3NlJ1xuICBdKTtcblxuICAvLyBBZGQgY3Vyc29yIGl0ZXJhdG9yc1xuICAvLyBUT0RPOiByZW1vdmUgdGhpcyBvbmNlIGJyb3dzZXJzIGRvIHRoZSByaWdodCB0aGluZyB3aXRoIHByb21pc2VzXG4gIFsnb3BlbkN1cnNvcicsICdvcGVuS2V5Q3Vyc29yJ10uZm9yRWFjaChmdW5jdGlvbihmdW5jTmFtZSkge1xuICAgIFtPYmplY3RTdG9yZSwgSW5kZXhdLmZvckVhY2goZnVuY3Rpb24oQ29uc3RydWN0b3IpIHtcbiAgICAgIC8vIERvbid0IGNyZWF0ZSBpdGVyYXRlS2V5Q3Vyc29yIGlmIG9wZW5LZXlDdXJzb3IgZG9lc24ndCBleGlzdC5cbiAgICAgIGlmICghKGZ1bmNOYW1lIGluIENvbnN0cnVjdG9yLnByb3RvdHlwZSkpIHJldHVybjtcblxuICAgICAgQ29uc3RydWN0b3IucHJvdG90eXBlW2Z1bmNOYW1lLnJlcGxhY2UoJ29wZW4nLCAnaXRlcmF0ZScpXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgICAgICB2YXIgbmF0aXZlT2JqZWN0ID0gdGhpcy5fc3RvcmUgfHwgdGhpcy5faW5kZXg7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmF0aXZlT2JqZWN0W2Z1bmNOYW1lXS5hcHBseShuYXRpdmVPYmplY3QsIGFyZ3Muc2xpY2UoMCwgLTEpKTtcbiAgICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYWxsYmFjayhyZXF1ZXN0LnJlc3VsdCk7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBwb2x5ZmlsbCBnZXRBbGxcbiAgW0luZGV4LCBPYmplY3RTdG9yZV0uZm9yRWFjaChmdW5jdGlvbihDb25zdHJ1Y3Rvcikge1xuICAgIGlmIChDb25zdHJ1Y3Rvci5wcm90b3R5cGUuZ2V0QWxsKSByZXR1cm47XG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKHF1ZXJ5LCBjb3VudCkge1xuICAgICAgdmFyIGluc3RhbmNlID0gdGhpcztcbiAgICAgIHZhciBpdGVtcyA9IFtdO1xuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICBpbnN0YW5jZS5pdGVyYXRlQ3Vyc29yKHF1ZXJ5LCBmdW5jdGlvbihjdXJzb3IpIHtcbiAgICAgICAgICBpZiAoIWN1cnNvcikge1xuICAgICAgICAgICAgcmVzb2x2ZShpdGVtcyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGl0ZW1zLnB1c2goY3Vyc29yLnZhbHVlKTtcblxuICAgICAgICAgIGlmIChjb3VudCAhPT0gdW5kZWZpbmVkICYmIGl0ZW1zLmxlbmd0aCA9PSBjb3VudCkge1xuICAgICAgICAgICAgcmVzb2x2ZShpdGVtcyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnNvci5jb250aW51ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIHZhciBleHAgPSB7XG4gICAgb3BlbjogZnVuY3Rpb24obmFtZSwgdmVyc2lvbiwgdXBncmFkZUNhbGxiYWNrKSB7XG4gICAgICB2YXIgcCA9IHByb21pc2lmeVJlcXVlc3RDYWxsKGluZGV4ZWREQiwgJ29wZW4nLCBbbmFtZSwgdmVyc2lvbl0pO1xuICAgICAgdmFyIHJlcXVlc3QgPSBwLnJlcXVlc3Q7XG5cbiAgICAgIGlmIChyZXF1ZXN0KSB7XG4gICAgICAgIHJlcXVlc3Qub251cGdyYWRlbmVlZGVkID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBpZiAodXBncmFkZUNhbGxiYWNrKSB7XG4gICAgICAgICAgICB1cGdyYWRlQ2FsbGJhY2sobmV3IFVwZ3JhZGVEQihyZXF1ZXN0LnJlc3VsdCwgZXZlbnQub2xkVmVyc2lvbiwgcmVxdWVzdC50cmFuc2FjdGlvbikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHAudGhlbihmdW5jdGlvbihkYikge1xuICAgICAgICByZXR1cm4gbmV3IERCKGRiKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVsZXRlOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdENhbGwoaW5kZXhlZERCLCAnZGVsZXRlRGF0YWJhc2UnLCBbbmFtZV0pO1xuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cDtcbiAgICBtb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gbW9kdWxlLmV4cG9ydHM7XG4gIH1cbiAgZWxzZSB7XG4gICAgc2VsZi5pZGIgPSBleHA7XG4gIH1cbn0oKSk7XG4iXX0=
