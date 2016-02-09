/**
*  Module
*
* Description
*/
var pennysplit = angular.module('PennySplit', ['ui.router']);

pennysplit.config(function($stateProvider, $urlRouterProvider) {
	
	$urlRouterProvider.otherwise("/");
  	
  	$stateProvider
    .state('welcome', {
      	url: '/',
      	templateUrl: "/assets/partials/welcome.html",
      	controller : 'WelcomeCtrl'
    });
});