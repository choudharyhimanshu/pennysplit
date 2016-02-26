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
    .state('edit', {
        url: '/edit/:slug',
        templateUrl: "/assets/partials/edit.html",
        controller: 'EditCtrl'
    })
    .state('view', {
      	url: '/view/:slug',
      	templateUrl: "/assets/partials/view.html",
      	controller: "ViewCtrl"
    })
    .state('about', {
        url: '/about/',
        templateUrl: "/assets/partials/about.html"
    });
});

pennysplit.run(['$rootScope', function($rootScope){
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        // console.log(fromState,toState);
    });
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        // console.log(fromState,toState);
    });
}]);

pennysplit.constant('GLOBALS', {
    'API_BASE' : '/api/'
});