'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
controller('AppCtrl', function($scope, $location) {

    $scope.goHome = function() {
        $location.url('view1');
    }


}).
controller('MyCtrl1', function($scope, $http, $timeout, socket, solrClient) {

    $scope.queryPost = function(query, start, rows) {
        console.log("QUERY: " + query);
        $scope.loading = true;
        solrClient.then(function(solrServices) {
            solrServices.queryPost(query, start, rows, $scope.currentTab).then(function(result) {

                console.log(result.responseHeader.params.q + ' ' + $scope.queryText);
                if (result.responseHeader.params.q === $scope.queryText) {
                    console.log("query: " + query);
                    console.log(result);
                    $scope.loading = false;

                    $scope.queryResults = result.response.docs;
                    if (!$scope.currentIndex) {
                        $scope.currentIndex = result.response.docs.length;
                        $scope.indexIncrement = $scope.currentIndex;
                        $scope.maxIndex = result.response.numFound;
                    } else {
                        $scope.currentIndex += result.response.docs.length;
                    }
                } else {
                    console.log("Discarded " + result.responseHeader.params.q + " results");
                }
            });
        });
    };

    $scope.queryAutocompleteResults = [];
    $scope.queryText = '';
    $scope.loading = false;
     var tempFilterText = '',
        filterTextTimeout;

    $scope.$watch('queryText', function(query) {
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

        tempFilterText = query;
        filterTextTimeout = $timeout(function() {
            if (query.length) {
            $scope.currentIndex = 0;
            $scope.indexIncrement = 0;
            $scope.maxIndex = 0;
            $scope.queryAutocomplete(query);
            $scope.queryPost(query, 0, 10);
        }
        }, 300); // delay 250 ms


    });

    $scope.queryAutocomplete = function(query) {
        solrClient.then(function(solrServices) {
            solrServices.queryAutocomplete(query).then(function(result) {
                var a = result.facet_counts.facet_fields.Title;
                $scope.queryAutocompleteResults = [];
                console.log("Autocomplete: ");
                console.log(result);
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
        if ($scope.queryText.length && rows <= $scope.maxIndex)
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

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab.sort;
        if ($scope.queryText.length) {
            $scope.currentIndex = 0;
            $scope.indexIncrement = 0;
            $scope.maxIndex = 0;
            $scope.queryPost($scope.queryText, 0, 10);
        }
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
                $scope.queryComments("PostId:" + $scope.queryResults[0].id, $scope.queryResults[0]);
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
                    $scope.queryComments("PostId:" + answer.id, answer);
                });
                $scope.answersResult = answers;
            });

        });

    }

    $scope.queryComments = function(query, obj) {
        solrClient.then(function(solrServices) {

            solrServices.queryComments(query).then(function(result) {
                console.log(result);
                var comments = result.response.docs;
                comments.forEach(function(comment) {
                    comment.CreationDate = Date.parse(comment.CreationDate);
                });

                obj.comments = comments;
                console.log("HEEEEEEEELLLLLLO " + obj);
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
