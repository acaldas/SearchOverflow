'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
controller('AppCtrl', function($scope) {

}).
controller('MyCtrl1', function($scope, $http, socket, solrClient) {

    $scope.queryPost = function(query, start, rows) {
        $scope.loading = true;
        solrClient.then(function(solrServices) {
            solrServices.queryPost(query, start, rows, $scope.currentTab).then(function(result) {
                console.log("query: " + query);
                console.log(result);
                $scope.loading = false;
                $scope.queryResults = result.response.docs;
                if(!$scope.currentIndex) {
                    $scope.currentIndex = result.response.docs.length;
                    $scope.indexIncrement = $scope.currentIndex;
                } else {
                    $scope.currentIndex += result.response.docs.length;
                }

                $scope.maxIndex = result.response.numFound;
            });
        });
    };

    $scope.queryAutocompleteResults = [];
    $scope.queryText = '';
    $scope.loading = false;

    $scope.$watch('queryText', function(query) {
        if (query.length) {
            $scope.currentIndex = 0;
            $scope.indexIncrement = 0;
            $scope.maxIndex = 0;
            $scope.queryAutocomplete(query);
            $scope.queryPost(query, 0, 10);
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

    };

    $scope.currentIndex = 0;
    $scope.indexIncrement = 0;
    $scope.maxIndex = 0;
    $scope.getMoreResults = function() {
        var rows = $scope.currentIndex + $scope.indexIncrement;
        if($scope.queryText.length && rows <= $scope.maxIndex)
            $scope.queryPost($scope.queryText, $scope.currentIndex, rows);
    };


    $scope.tabs = [{
            title: 'Relevance',
            sort: 'score'
        }, {
            title: 'Score',
            sort: 'Score'
        }, {
            title: 'Recent',
            sort: 'CreationDate'
    }];

    $scope.currentTab = 'score';

    $scope.onClickTab = function (tab) {
        $scope.currentTab = tab.sort;
        $scope.currentIndex = 0;
        $scope.indexIncrement = 0;
        $scope.maxIndex = 0;
        $scope.queryPost($scope.queryText, 0, 10);
    }

    $scope.isActiveTab = function(tabSort) {
        return tabSort === $scope.currentTab;
    }

}).
controller('MyCtrl2', function($scope, solrClient) {
    $scope.queryPostById = function(query) {
        console.log(query);
        solrClient.then(function(solrServices) {

            solrServices.queryPostById(query).then(function(result) {
                console.log(result);

                $scope.queryResults = result.response.docs;
            });

        });

    }

    $scope.queryAnswers = function(query) {
        console.log(query);
        solrClient.then(function(solrServices) {

            solrServices.queryAnswers(query).then(function(result) {
                console.log(result);
                var answers = result.response.docs;
                answers.forEach(function(answer) {
                    answer.CreationDate = Date.parse(answer.CreationDate);
                });
                $scope.answersResult = answers;
            });

        });

    }



    var init = function() {
        var term = window.location.search.substring(1);
        var pair = term.split("=");
        var id = pair[1];

        $scope.queryPostById("id:" + id);
        $scope.queryAnswers("ParentId:" + id);
    };

    init();
});
