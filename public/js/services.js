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

            socket.emit('solr:query', q);

            socket.on('solr:queryResult', function(result) {
                deferred.resolve(result);
            });

            return deferred.promise;
        },
        queryAutocomplete: function(q) {
            var deferred = $q.defer();

            socket.emit('solr:autocomplete', q);

            socket.on('solr:autocompleteResult', function(result) {
                deferred.resolve(result);
            });

            return deferred.promise;
        },
        getPost: function(id) {
            var deferred = $q.defer();

            socket.emit('solr:getpost', id);

            socket.on('solr:getpostResult', function(result) {
                deferred.resolve(result);
            });

            return deferred.promise;
        },

            queryPostById: function (q) {
                var deferred = $q.defer();

                var url = 'http://localhost:8983/solr/#/posts/select';
                socket.emit('solr:queryPostById', q);

                socket.on('solr:queryPostByIdResult', function (result) {
                    deferred.resolve(result);
                });

                return deferred.promise;
            },

            queryAnswers: function (q) {
                var deferred = $q.defer();

                socket.emit('solr:queryAnswers', q);

                socket.on('solr:answersResult', function (result) {
                    deferred.resolve(result);
                });

                return deferred.promise;
            }
        };

        var init = function () {
            var deferred = $q.defer();
            if (ready)
                deferred.resolve(solrServices);
            });
        }

        return deferred.promise;
    };

    return init();



}).
value('version', '0.1');
