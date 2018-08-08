IndexController.prototype._registerServiceWorker = function() {
    if (!navigator.serviceWorker) return;
  
    var indexController = this;
  
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
      if (!navigator.serviceWorker.controller) {
        return;
      }
  
      if (reg.waiting) {
        indexController._updateReady(reg.waiting);
        return;
      }
  
      if (reg.installing) {
        indexController._trackInstalling(reg.installing);
        return;
      }
  
      reg.addEventListener('updatefound', function() {
        indexController._trackInstalling(reg.installing);
      });
    });
  
    // TODO: listen for the controlling service worker changing
    // and reload the page
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      window.location.reload();
    });
  };
  
  IndexController.prototype._trackInstalling = function(worker) {
    var indexController = this;
    worker.addEventListener('statechange', function() {
      if (worker.state == 'installed') {
        indexController._updateReady(worker);
      }
    });
  };
  
  IndexController.prototype._updateReady = function(worker) {
    var toast = this._toastsView.show("New version available", {
      buttons: ['refresh', 'dismiss']
    });
  
    toast.answer.then(function(answer) {
      if (answer != 'refresh') return;
      // TODO: tell the service worker to skipWaiting
      worker.postMessage({action: 'reload'});
    });
  };