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
      	controller: 'WelcomeCtrl'
    })
    .state('create', {
      	url: '/create/',
      	templateUrl: "/assets/partials/create.html",
      	controller: 'CreateCtrl'
    })
    .state('view', {
      	url: '/view/:slug',
      	templateUrl: "/assets/partials/view.html",
      	controller: "ViewCtrl"
    });
});