
pennysplit.controller('WelcomeCtrl', ['$scope','$rootScope', function($scope,$rootScope){
	console.log('WelcomeCtrl');
}]);

pennysplit.controller('CreateCtrl', ['$scope','$state','EventSrv', function($scope,$state,EventSrv){

	var count_members = 1;

	$scope.is_loading = false;
	$scope.create = {
		title : '',
		currency : 'INR',
		owner : '',
		members : [
			{id : count_members++,name : ''},
			{id : count_members++,name : ''},
			{id : count_members++,name : ''},
			{id : count_members++,name : ''}
		]
	};

	$scope.addMember = function(){
		if($scope.create.members.length < 50){
			$scope.create.members.push({
				id : count_members++,
				name : ''
			});
		}
	};

	$scope.removeMember = function(member_id){
		var index = null;
		for(var i = 0; i < $scope.create.members.length; i++){
			if($scope.create.members[i].id == member_id){
				index = i;
			}
		}
		if(index != null){
			$scope.create.members.splice(index,1);
		}
	}

	$scope.submit = function(){
		if($scope.createForm.$valid && $scope.create.members.length > 0){
			$scope.message = 'Loading..';
			$scope.is_loading = true;
			$scope.create.members.push({
				id : count_members++,
				name : $scope.create.owner
			});
			EventSrv.createEvent($scope.create).success(function(response){
				if(response.success == true){
					$state.go('edit.expense_add',{slug:response.data.slug});
				}
				$scope.is_loading = false;
				$scope.message = response.message;
			}).error(function(response){
				$scope.is_loading = false;
				$scope.message = 'Some error occured. Please try again later.';
			});
		}
	};	
}]);

pennysplit.controller('ViewCtrl', ['$rootScope','$stateParams', function($rootScope,$stateParams){
	$rootScope.slug = $stateParams.slug;
}]);

pennysplit.controller('EditCtrl', ['$scope','$rootScope','$stateParams','EventSrv', function($scope,$rootScope,$stateParams,EventSrv){
	if($stateParams.slug){
		EventSrv.getPvtEvent($stateParams.slug).success(function(response){
			$scope.event_data = response.data;
		}).error(function(response){
			console.log(response);
		});
	}
	else {
		$scope.message = 'Invalid URL.';
	}
}]);


pennysplit.controller('AddExpenseCtrl', ['$scope','$state','EventSrv', function($scope,$state,EventSrv){
	var checkForTrue = function(arr){
		var flag = false;
		for (var i = arr.length - 1; i >= 0; i--) {
			if (arr[i] == true){
				flag = true;
				break;
			}
		}
		return flag;
	}

	var getNameFromId = function(arr, id){
		for (var i = arr.length - 1; i >= 0; i--) {
			if (arr[i].id == id){
				return arr[i].name;
			}
		}
	}
	$scope.form_expense = {
		name : '',
		payers : [{
			id : '',
			amount : ''
		}],
		payees : []
	};
	$scope.addPayer = function(){
		$scope.flag_min_payers = false;
		$scope.form_expense.payers.push({
			id : '',
			amount : ''
		});
	}
	$scope.removePayer = function(index){
		if($scope.form_expense.payers.length > 1){
			$scope.form_expense.payers.splice(index,1);
		}
		else {
			$scope.flag_min_payers = true;
		}
	}
	$scope.submitExpense = function(){
		if($scope.expenseForm.$valid && checkForTrue($scope.form_expense.payees)){
			// $scope.form_expense.members = $scope.event_data.members;
			for (var i = $scope.form_expense.payers.length - 1; i >= 0; i--) {
				// $scope.form_expense.payers[i].id = parseInt($scope.form_expense.payers[i].id);
				$scope.form_expense.payers[i].name = getNameFromId($scope.event_data.members,$scope.form_expense.payers[i].id);
			}
			var payees = [];
			for (var i = $scope.form_expense.payees.length - 1; i >= 0; i--) {
				if($scope.form_expense.payees[i] == true){
					payees.push({
						id : i,
						name : getNameFromId($scope.event_data.members,i)
					});
				}
			}
			$scope.form_expense.payees = payees;
			EventSrv.addExpense($scope.event_data.slug,$scope.form_expense).success(function(response){
				if(response.success == true){
					$state.go('edit.expense_add',{slug:$scope.event_data.slug},{reload:true});
				}
				$scope.message = response.message;	
			}).error(function(response){
				$scope.message = 'Some error occured.';
			});
		}
		else {
			$scope.message = 'Invalid inputs.';
		}
	}

	$scope.$watch('flag_mul_payer',function(newValue){
		if(newValue){
			$scope.addPayer();
		}
		else {
			$scope.form_expense.payers = [$scope.form_expense.payers[0]];
		}
	});
}]);

pennysplit.controller('EditEventCtrl', ['$scope','$state','EventSrv', function($scope,$state,EventSrv){
	
	var maxId = function(arr){
		var id = -1;
		for (var i = arr.length - 1; i >= 0; i--) {
			if(arr[i].id > id){
				id = arr[i].id;
			}
		}
		return parseInt(id);
	}

	$scope.$watch('event_data',function(val){
		if(val){
			var count_members = maxId($scope.event_data.members) + 1; // To be FIXED!!

			$scope.is_loading = false;
			$scope.create = {
				title : $scope.event_data.title,
				currency : $scope.event_data.currency,
				owner : $scope.event_data.owner,
				members : $scope.event_data.members
			};

			$scope.addMember = function(){
				if($scope.create.members.length < 50){
					$scope.create.members.push({
						id : count_members++,
						name : ''
					});
				}
			};

			$scope.removeMember = function(member_id){
				var index = null;
				for(var i = 0; i < $scope.create.members.length; i++){
					if($scope.create.members[i].id == member_id){
						index = i;
					}
				}
				if(index != null){
					$scope.create.members.splice(index,1);
				}
			}

			$scope.submitEditEvent = function(){
				if($scope.createForm.$valid && $scope.create.members.length > 0){
					$scope.message = 'Loading..';
					$scope.is_loading = true;
					EventSrv.updateEvent($scope.event_data.slug,$scope.create).success(function(response){
						if(response.success == true){
							$state.go('edit.expense_add',{slug:response.data.slug},{reload:true});
						}
						$scope.is_loading = false;
						$scope.message = response.message;
					}).error(function(response){
						$scope.is_loading = false;
						$scope.message = 'Some error occured. Please try again later.';
					});
				}
			};
		}
	});	
}]);