'use strict';

/* Services */

angular.module('myApp.services', []).
factory('socket', function(socketFactory) {
    return socketFactory();
}).
factory('solrClient', function(socket, $q, $http) {

    var ready = false;
    var solrServices = {
        queryPost: function(q) {
            var deferred = $q.defer();

            var url = 'http://localhost:8983/solr/#/posts/select';
            socket.emit('solr:query', q);

            socket.on('solr:queryResult', function(result) {
                deferred.resolve(result);
            });

            return deferred.promise;
        }
    };

    var init = function() {
        var deferred = $q.defer();
        if (ready)
            deferred.resolve(solrServices);
        else {
            socket.emit('solr:ask');
            socket.on('solr:ready', function() {
                ready = true;
                deferred.resolve(solrServices);
            });
        }

        return deferred.promise;
    };

    return init();



}).
value('version', '0.1');
