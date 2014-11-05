'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
    controller('AppCtrl', function ($scope) {

    }).
    controller('MyCtrl1', function ($scope, $http, socket, solrClient) {
        $http({
            method: 'GET',
            url: '/api/name',
            cache: true
        }).
            success(function (data, status, headers, config) {
                console.log("REST: " + data.name);
                $scope.name = data.name;
            });

        socket.on('send:name', function (data) {
            console.log("Socket: " + data.name);
            $scope.name = data.name;
        });

        $scope.queryPost = function (query) {
            console.log(query);
            solrClient.then(function (solrServices) {

                solrServices.queryPost(query).then(function (result) {
                    console.log(result);

                    $scope.queryResults = result.response.docs;
                    console.log($scope.queryResults.length);
                });

            });

        }

    }).
    controller('MyCtrl2', function ($scope) {
        // write Ctrl here
    });
