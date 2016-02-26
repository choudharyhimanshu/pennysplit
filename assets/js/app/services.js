
pennysplit.service('EventSrv', ['$http','GLOBALS', function($http,GLOBALS){
	this.createEvent = function(form_data){
		return $http.post(GLOBALS.API_BASE+'event/create',form_data);
	}
}]);