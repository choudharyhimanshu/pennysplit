
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

pennysplit.controller('EditCtrl', ['$scope','$state','$stateParams','EventSrv', function($scope,$state,$stateParams,EventSrv){
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

	$scope.removeExpense = function(exid){
		if (exid !== undefined) {
			EventSrv.deleteExpense($stateParams.slug,exid).success(function(response){
				if (response.success == true) {
					$state.go($state.current, {}, {reload: true});
				}
				$scope.message = response.message;
			}).error(function(response){
				$scope.message = 'Could not delete expense.';
			});
		}
	}
}]);


pennysplit.controller('AddExpenseCtrl', ['$scope','$state','EventSrv', function($scope,$state,EventSrv){
	var checkForTrue = function(arr){
		var flag = false;
		for (var i = arr.length - 1; i >= 0; i--) {
			if (arr[i].flag == true){
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
		payers : [],
		payees : []
	};

	$scope.$watch('event_data',function(val){
		if(val){
			for (var i = 0; i < $scope.event_data.members.length; i++) {

				$scope.form_expense.payers.push({
					id : $scope.event_data.members[i].id,
					name : $scope.event_data.members[i].name,
					amount : ''
				});

				$scope.form_expense.payees.push({
					id : $scope.event_data.members[i].id,
					name : $scope.event_data.members[i].name,
					flag : true
				});
			}
		}
	})
	
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
			var form_expense_master = {
				name : $scope.form_expense.name,
				payers : $scope.form_expense.payers,
				payees : []
			};
			for (var i = $scope.form_expense.payees.length - 1; i >= 0; i--) {
				if($scope.form_expense.payees[i].flag == true){
					form_expense_master.payees.push($scope.form_expense.payees[i]);
				}
			}
			EventSrv.addExpense($scope.event_data.slug,form_expense_master).success(function(response){
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