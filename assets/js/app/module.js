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
        controller: "EditCtrl"
    })
    .state('edit.home', {
        url: '/',
        templateUrl: "/assets/partials/edit.html",
        controller: "EditCtrl"
    })
    .state('event_edit', {
        url: '/edit/:slug/event/edit',
        templateUrl: "/assets/partials/event.edit.html",
        controller: "EditEventCtrl"
    })
    .state('expense_add', {
        url: '/edit/:slug/expense/add',
        templateUrl: "/assets/partials/expense.add.html",
        controller: "AddExpenseCtrl"
    })
    .state('edit.expense_edit', {
        url: '/expense/edit/:id',
        templateUrl: "/assets/partials/expense.edit.html"
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
        angular.element('#error_modal').modal('hide');
    });
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        // console.log(fromState,toState);
        $rootScope.stateFrom = fromState;
        $rootScope.stateFromParams = fromParams;
    });
}]);

pennysplit.constant('GLOBALS', {
    'API_BASE' : '/api/'
});