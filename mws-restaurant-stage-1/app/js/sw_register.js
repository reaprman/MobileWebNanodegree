if(navigator.serviceWorker) {

    navigator.serviceWorker.register('/sw.js').then(function() {
        console.log('Service Worker: Registered')
    }).catch(function(err){
        console.log('Service Worker: Registration Failure ' + err);
    });
}