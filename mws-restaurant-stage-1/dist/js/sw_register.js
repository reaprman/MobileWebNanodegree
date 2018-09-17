"use strict";if (navigator.serviceWorker) {

  navigator.serviceWorker.register('/sw.js').then(function (reg) {
    console.log('Service Worker: Registered' + reg);
  }).catch(function (err) {
    console.log('Service Worker: Registration Failure ' + err);
  });
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN3X3JlZ2lzdGVyLmpzIl0sIm5hbWVzIjpbIm5hdmlnYXRvciIsInNlcnZpY2VXb3JrZXIiLCJyZWdpc3RlciIsInRoZW4iLCJyZWciLCJjb25zb2xlIiwibG9nIiwiY2F0Y2giLCJlcnIiXSwibWFwcGluZ3MiOiJhQUFBLElBQUdBLFNBQVMsQ0FBQ0MsYUFBYixFQUE0Qjs7QUFFeEJELEVBQUFBLFNBQVMsQ0FBQ0MsYUFBVixDQUF3QkMsUUFBeEIsQ0FBaUMsUUFBakMsRUFBMkNDLElBQTNDLENBQWdELFVBQVNDLEdBQVQsRUFBYztBQUMxREMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksK0JBQStCRixHQUEzQztBQUNILEdBRkQsRUFFR0csS0FGSCxDQUVTLFVBQVNDLEdBQVQsRUFBYTtBQUNsQkgsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMENBQTBDRSxHQUF0RDtBQUNILEdBSkQ7QUFLSCIsInNvdXJjZXNDb250ZW50IjpbImlmKG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyKSB7XHJcblxyXG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zdy5qcycpLnRoZW4oZnVuY3Rpb24ocmVnKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyOiBSZWdpc3RlcmVkJyArIHJlZylcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2UgV29ya2VyOiBSZWdpc3RyYXRpb24gRmFpbHVyZSAnICsgZXJyKTtcclxuICAgIH0pO1xyXG59Il0sImZpbGUiOiJzd19yZWdpc3Rlci5qcyJ9

//# sourceMappingURL=sw_register.js.map
