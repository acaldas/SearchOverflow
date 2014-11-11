'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
    controller('AppCtrl', function ($scope) {

}).
controller('MyCtrl1', function($scope, $http, socket, solrClient) {

    $scope.queryPost = function(query) {
        solrClient.then(function(solrServices) {
            solrServices.queryPost(query).then(function(result) {
                console.log("query: " + query);
                console.log(result);
                $scope.queryResults = result.response.docs;
            });
        });
    };

    $scope.queryAutocompleteResults = [];
    $scope.queryText = '';

    $scope.$watch('queryText',function(query){
        if(query.length) {
            $scope.queryAutocomplete(query);
            $scope.queryPost(query);
        }
    });

   $scope.queryAutocomplete = function(query) {
            solrClient.then(function(solrServices) {
                solrServices.queryAutocomplete(query).then(function(result) {
                    var a = result.facet_counts.facet_fields.Title;
                    $scope.queryAutocompleteResults = [];

                    for (var i = 0; i < a.length; i += 2) {
                        $scope.queryAutocompleteResults.push(a[i]);
                    }
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
