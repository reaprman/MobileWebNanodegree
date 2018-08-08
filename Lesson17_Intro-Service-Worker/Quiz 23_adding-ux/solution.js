IndexController.prototype._registerServiceWorker = function() {
  if (!navigator.serviceWorker) return;

  var indexController = this;

  navigator.serviceWorker.register('/sw.js').then(function(reg) {
    // TODO: if there's no controller, this page wasn't loaded
    // via a service worker, so they're looking at the latest version.
    // In that case, exit early
    if (!navigator.serviceWorker.controller) return;

    // TODO: if there's an updated worker already waiting, call
    // indexController._updateReady()
    if (reg.waiting) {
      indexController._updateReady();
      return;
    }

    // TODO: if there's an updated worker installing, track its
    // progress. If it becomes "installed", call
    // indexController._updateReady()
    if (reg.installing) {
      var sw = reg.installing; 
      sw.addEventListener('statechange', function() {
        if(sw == 'installed') {
          indexController._updateReady();
        }
      });
      return;
    }

    // TODO: otherwise, listen for new installing workers arriving.
    // If one arrives, track its progress.
    // If it becomes "installed", call
    // indexController._updateReady()
    reg.addEventListener('updatefound', function() {
      reg.installing.addEventListener('statechange', function() {
        if (this.state == 'installed') {
          indexController._updateReady();
          return;
        }
      })
    })
  });
};