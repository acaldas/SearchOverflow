'use strict';

/* Services */

angular.module('myApp.services', []).
  factory('socket', function (socketFactory) {
    return socketFactory();
  }).
  value('version', '0.1');
