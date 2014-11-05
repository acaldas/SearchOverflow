'use strict';

/* Services */

angular.module('myApp.services', []).
  factory('socket', function (socketFactory) {
    return socketFactory();
  }).
  factory('solrClient', function(socket, $q) {

    var ready = false;
    var solrServices = {
        test: "test"
    };

    var init = function() {
        var deferred = $q.defer();
        if(ready)
            deferred.resolve(solrServices);
        else {
            console.log("Asking solr");
            socket.emit('solr:ask');
            socket.on('solr:ready', function () {
                ready = true;
                deferred.resolve(solrServices);
            });
        }

        return deferred.promise;
    };

    return init();



  }).
  value('version', '0.1');
