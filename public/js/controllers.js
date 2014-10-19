'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope) {

  }).
  controller('MyCtrl1', function ($scope, $http, socket) {
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

  }).
  controller('MyCtrl2', function ($scope) {
    // write Ctrl here
  });
