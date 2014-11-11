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
    controller('MyCtrl2', function ($scope, solrClient) {
        $scope.queryPostById = function (query) {
            console.log(query);
            solrClient.then(function (solrServices) {

                solrServices.queryPostById(query).then(function (result) {
                    console.log(result);

                    $scope.queryResults = result.response.docs;
                    console.log($scope.queryResults.length);
                });

            });

        }

        $scope.queryAnswers = function (query) {
            console.log(query);
            solrClient.then(function (solrServices) {

                solrServices.queryAnswers(query).then(function (result) {
                    console.log(result);

                    $scope.answersResult = result.response.docs;
                    console.log($scope.answersResult.length);
                });

            });

        }



        var init = function () {
            var term = window.location.search.substring(1);
            var pair = term.split("=");
            var id = pair[1];

            $scope.queryPostById("id:"+id);
            $scope.queryAnswers("ParentId:"+id);
        };

        init();
    });
