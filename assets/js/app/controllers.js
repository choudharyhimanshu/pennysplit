
pennysplit.controller('WelcomeCtrl', ['$scope','$rootScope', function($scope,$rootScope){
	console.log('WelcomeCtrl');
}]);

pennysplit.controller('CreateCtrl', ['$scope','$state','EventSrv', function($scope,$state,EventSrv){

	$scope.is_loading = false;
	$scope.create = {
		title : '',
		currency : 'INR',
		owner : '',
		members : [
			{id : null,name : ''},
			{id : null,name : ''},
			{id : null,name : ''}
		]
	};

	$scope.addMember = function(){
		if($scope.create.members.length < 50){
			$scope.create.members.push({
				id : null,
				name : ''
			});
		}
	};

	$scope.removeMember = function(member_id){
		$scope.create.members.splice(member_id,1);
	}

	$scope.submit = function(){
		if($scope.createForm.$valid && $scope.create.members.length > 0){
			$scope.message = 'Loading..';
			$scope.is_loading = true;
			$scope.create.members.push({
				id : $scope.create.members.length,
				name : $scope.create.owner
			});
			for(var i=0; i<$scope.create.members.length;i++){
				$scope.create.members[i].id=i;
			}
			EventSrv.createEvent($scope.create).success(function(response){
				if(response.success == true){
					$state.go('expense_add',{slug:response.data.slug});
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

pennysplit.controller('EditEventCtrl', ['$scope','$rootScope','$state','$stateParams','EventSrv','UtilsSrv', function($scope,$rootScope,$state,$stateParams,EventSrv,UtilsSrv){
	if($stateParams.slug){
		EventSrv.getPvtEvent($stateParams.slug).success(function(response){
			$scope.event_data = response.data;
			var deleted_members = [];

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
						id : UtilsSrv.maxId($scope.create.members)+1,
						name : ''
					});
				}
			};

			$scope.removeMember = function(index){
				deleted_members.push($scope.create.members[index].id);
				$scope.create.members.splice(index,1);
			}

			$scope.submitEditEvent = function(){
				if($scope.createForm.$valid && $scope.create.members.length > 0){
					$scope.message = 'Loading..';
					$scope.is_loading = true;
					$scope.create.delete_members = deleted_members;
					EventSrv.updateEvent($scope.event_data.slug,$scope.create).success(function(response){
						if(response.success == true){
							$state.go('expense_add',{slug:response.data.slug},{reload:true});
						}
						$scope.is_loading = false;
						$scope.message = response.message;
					}).error(function(response){
						$scope.is_loading = false;
						$scope.message = 'Some error occured. Please try again later.';
					});
				}
			};

			$scope.cancelEditEvent = function(){
				if($rootScope.stateFrom.name != ""){
					$state.go($rootScope.stateFrom,$rootScope.stateFromParams);
				}
				else {
					$state.go("edit",{slug:$stateParams.slug});
				}
			}

		}).error(function(response){
			console.log(response);
		});
	}
	else {
		$scope.message = 'Invalid URL.';
	}
}]);

pennysplit.controller('ViewCtrl', ['$rootScope','$stateParams', function($rootScope,$stateParams){
	$rootScope.slug = $stateParams.slug;
}]);

pennysplit.controller('EditCtrl', ['$scope','$state','$stateParams','EventSrv','UtilsSrv', function($scope,$state,$stateParams,EventSrv,UtilsSrv){
	if($stateParams.slug){
		var addPayment = function(id,amount){
			for (var i = $scope.event_balances.length - 1; i >= 0; i--) {
				if($scope.event_balances[i].id == id){
					$scope.event_balances[i].balance += amount;
				}
			}
		}

		EventSrv.getPvtEvent($stateParams.slug).success(function(response){
			if(response.success){
				$scope.event_data = response.data;
			}
			else {
				$scope.message = response.message;
			}
		}).error(function(response){
			console.log(response);
		});

		EventSrv.getPvtEventSettlements($stateParams.slug).success(function(response){
			if(response.success){
				$scope.balances = response.data.balances;
				$scope.balance_baskets = response.data.baskets;			
				$scope.settlements = response.data.settlements;
			}
			else {
				$scope.message = response.message;
			}
		}).error(function(response){
			console.log(response);
		});

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
	}
	else {
		$scope.message = 'Invalid URL.';
	}
}]);


pennysplit.controller('AddExpenseCtrl', ['$scope','$state','$stateParams','EventSrv','UtilsSrv', function($scope,$state,$stateParams,EventSrv,UtilsSrv){
	if($stateParams.slug){
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

		$scope.form_expense = {
			name : '',
			added_by : null,
			payers : [{
				id : 0,
				amount : 0
			}],
			payees : []
		};

		var form_expense_master = {
			name : '',
			added_by : null,
			payers : [],
			payees : []
		};

		EventSrv.getPvtEvent($stateParams.slug).success(function(response){
			$scope.event_data = response.data;

			$scope.form_expense.payers[0].id = $scope.event_data.members[0].id;

			for (var i = 0; i < response.data.members.length; i++) {
				$scope.form_expense.payees.push({
					id : response.data.members[i].id,
					name : response.data.members[i].name,
					flag : true
				});
				form_expense_master.payers.push({
					id : response.data.members[i].id,
					name : response.data.members[i].name,
					amount : 0
				});
			}
		}).error(function(response){
			console.log(response);
		});

		$scope.$watch('flag_multiple_payers',function(val){
			$scope.form_expense.payers.splice(1);
			if(val){
				$scope.form_expense.payers.push({
					id : $scope.event_data.members[0].id,
					amount : 0
				});
				$scope.form_expense.payers.push({
					id : $scope.event_data.members[0].id,
					amount : 0
				});
			}
		});

		$scope.$watch('flag_share_all',function(val){
			if(val){
				for (var i=0; i < $scope.form_expense.payees.length; i++){
					$scope.form_expense.payees[i].flag = true;
				}
			}
		});		

		$scope.addPayer = function(){
			$scope.flag_min_payers = false;
			$scope.form_expense.payers.push({
				id : $scope.event_data.members[0].id,
				amount : 0
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

		$scope.submitExpense = function(flag_add_another){
			if($scope.expenseForm.$valid && checkForTrue($scope.form_expense.payees)){
				for (var i = 0; i < form_expense_master.payers.length; i++) {
					form_expense_master.payers[i].amount = 0;
				}
				form_expense_master.payees.splice(0);
				form_expense_master.name = $scope.form_expense.name;
				form_expense_master.added_by = $scope.form_expense.added_by;
				for (var i = 0; i < $scope.form_expense.payers.length; i++) {
					form_expense_master.payers[UtilsSrv.getIndexbyId(form_expense_master.payers,$scope.form_expense.payers[i].id)].amount += $scope.form_expense.payers[i].amount;
				}
				for (var i = 0; i < $scope.form_expense.payees.length; i++) {
					if($scope.form_expense.payees[i].flag == true){
						form_expense_master.payees.push($scope.form_expense.payees[i]);
					}
				}

				EventSrv.addExpense($scope.event_data.slug,form_expense_master).success(function(response){
					if(response.success == true){
						if (flag_add_another) {
							$state.go('expense_add',{slug:$scope.event_data.slug},{reload:true});
						}
						else {
							$state.go('edit',{slug:$scope.event_data.slug},{reload:true});
						}
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
	}
	else {
		$scope.message = 'Invalid URL.';
	}
}]);

