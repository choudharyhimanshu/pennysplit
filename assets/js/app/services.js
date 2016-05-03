
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
	this.getPvtEventSettlements = function(slug){
		return $http.get(GLOBALS.API_BASE+'event/settlement/private/'+slug);
	}
	this.addExpense = function(slug,form_data){
		return $http.post(GLOBALS.API_BASE+'expense/add/'+slug,form_data);
	}
	this.deleteExpense = function(slug,exid){
		return $http.delete(GLOBALS.API_BASE+'expense/delete/'+slug+'/'+exid);
	}
}]);

pennysplit.service('UtilsSrv', ['$rootScope',function($rootScope){
	this.maxId = function(arr){
		var max_id = -1;
		for(var i=0;i<arr.length;i++){
			if(max_id < parseInt(arr[i].id)){
				max_id = parseInt(arr[i].id);
			}
		}
		return max_id;
	}
	this.getIndexbyId = function(arr,id){
		for(var i=0;i<arr.length;i++){
			if(id == arr[i].id){
				return i;
			}
		}
		return null;
	}
}]);