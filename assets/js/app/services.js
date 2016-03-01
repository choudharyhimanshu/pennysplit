
pennysplit.service('EventSrv', ['$http','$stateParams','GLOBALS', function($http,$stateParams,GLOBALS){
	this.createEvent = function(form_data){
		return $http.post(GLOBALS.API_BASE+'event/create',form_data);
	}
	this.updateEvent = function(slug,form_data){
		return $http.put(GLOBALS.API_BASE+'event/edit/'+slug,form_data);
	}
	this.getPvtEvent = function(slug){
		return $http.get(GLOBALS.API_BASE+'event/view/private/'+slug);
	}
	this.addExpense = function(slug,form_data){
		return $http.post(GLOBALS.API_BASE+'expense/add/'+slug,form_data);
	}
}]);