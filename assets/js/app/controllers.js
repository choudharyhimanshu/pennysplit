
pennysplit.controller('WelcomeCtrl', ['$scope','$rootScope', function($scope,$rootScope){
	console.log('Welcome User.');
}]);

pennysplit.controller('CreateCtrl', ['$scope','$rootScope','$state','EventSrv', function($scope,$rootScope,$state,EventSrv){

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
			for(var i=0; i<$scope.create.members.length;i++){
				if ($scope.create.members[i].name == '' || $scope.create.members[i].name === undefined) {
					$scope.create.members.splice(i,1);
					i--;
				}
			}
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
				else {
					$rootScope.msg = response.message;
					angular.element('#error_modal').modal('show');
				}
			}).error(function(response){
				$rootScope.msg = 'Unknown Error.';
				angular.element('#error_modal').modal('show');
			});
		}
	};
}]);

pennysplit.controller('EditEventCtrl', ['$scope','$rootScope','$state','$stateParams','EventSrv','UtilsSrv', function($scope,$rootScope,$state,$stateParams,EventSrv,UtilsSrv){
	if($stateParams.slug){
		EventSrv.getPvtEvent($stateParams.slug).success(function(response){
			if (response.success != true) {
				$rootScope.msg = response.message;
				angular.element('#error_modal').modal('show');
				return false;
			}

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
						else{
							$rootScope.msg = response.message;
							angular.element('#error_modal').modal('show');
						}
					}).error(function(response){
						$rootScope.msg = 'Unknown Error.';
						angular.element('#error_modal').modal('show');
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
			$rootScope.msg = 'Unknown Error.';
			angular.element('#error_modal').modal('show');
		});
	}
	else {
		$rootScope.msg = 'Invalid URL.';
		angular.element('#error_modal').modal('show');
	}
}]);

pennysplit.controller('ViewCtrl', ['$scope','$rootScope','$stateParams','EventSrv', function($scope,$rootScope,$stateParams,EventSrv){
	if($stateParams.slug){
		EventSrv.getPubEvent($stateParams.slug).success(function(response){
			if(response.success){
				$scope.event_data = response.data;
				$scope.balances = response.data.settlements.balances;
				$scope.balance_baskets = response.data.settlements.baskets;			
				$scope.settlements = response.data.settlements.settlements;
			}
			else {
				$rootScope.msg = response.message;
				angular.element('#error_modal').modal('show');
			}
		}).error(function(response){
			$rootScope.msg = 'Unknown Error.';
			angular.element('#error_modal').modal('show');
		});
	}
	else {
		$rootScope.msg = 'Invalid URL.';
		angular.element('#error_modal').modal('show');
	}
}]);

pennysplit.controller('EditCtrl', ['$scope','$rootScope','$state','$stateParams','$window','EventSrv','UtilsSrv', function($scope,$rootScope,$state,$stateParams,$window,EventSrv,UtilsSrv){
	if($stateParams.slug){
		EventSrv.getPvtEvent($stateParams.slug).success(function(response){
			if(response.success){
				$scope.event_data = response.data;
				$rootScope.view_url = response.data.view_url;
				$rootScope.edit_url = response.data.edit_url;
			}
			else {
				$rootScope.msg = response.message;
				angular.element('#error_modal').modal('show');
			}
		}).error(function(response){
			$rootScope.msg = 'Unknown Error.';
			angular.element('#error_modal').modal('show');
		});

		EventSrv.getPvtEventSettlements($stateParams.slug).success(function(response){
			if(response.success){
				$scope.balances = response.data.balances;
				$scope.balance_baskets = response.data.baskets;			
				$scope.settlements = response.data.settlements;
			}
			else {
				$rootScope.msg = response.message;
				angular.element('#error_modal').modal('show');
			}
		}).error(function(response){
			console.log(response);
		});

		$scope.removeExpense = function(exid){
			if (exid !== undefined) {
				var do_delete = $window.confirm('Are you absolutely sure you want to delete?');

				if(do_delete){
					EventSrv.deleteExpense($stateParams.slug,exid).success(function(response){
						if (response.success == true) {
							$state.go($state.current, {}, {reload: true});
						}
						else {
							$rootScope.msg = response.message;
							angular.element('#error_modal').modal('show');
						}
					}).error(function(response){
						$rootScope.msg = 'Could not delete expense.';
						angular.element('#error_modal').modal('show');
					});
				}
			}
		}
	}
	else {
		$rootScope.msg = 'Invalid URL.';
		angular.element('#error_modal').modal('show');
	}
}]);


pennysplit.controller('AddExpenseCtrl', ['$scope','$rootScope','$state','$stateParams','$window','EventSrv','UtilsSrv', function($scope,$rootScope,$state,$stateParams,$window,EventSrv,UtilsSrv){
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
			if (response.success != true) {
				$rootScope.msg = response.message;
				angular.element('#error_modal').modal('show');
				return false;
			}
			$scope.event_data = response.data;

			$scope.form_expense.payers[0].id = UtilsSrv.maxId($scope.event_data.members);

			for (var i = 0; i < response.data.members.length; i++) {
				$scope.form_expense.payees.push({
					id : response.data.members[i].id,
					name : response.data.members[i].name,
					amount : 0,
					flag : true
				});
				form_expense_master.payers.push({
					id : response.data.members[i].id,
					name : response.data.members[i].name,
					amount : 0
				});
			}
		}).error(function(response){
			$rootScope.msg = 'Unknown Error.';
			angular.element('#error_modal').modal('show');
		});

		$scope.$watch('flag_multiple_payers',function(val){
			$scope.form_expense.payers.splice(1);
			if(val){
				$scope.addPayer();
				$scope.addPayer();
			}
		});

		$scope.$watch('flag_share_all',function(val){
			if(val){
				for (var i=0; i < $scope.form_expense.payees.length; i++){
					$scope.form_expense.payees[i].flag = true;
				}
			}
		});

		var count_payers = 0;
		$scope.addPayer = function(){
			if (count_payers >= $scope.event_data.members.length) {
				count_payers = 0;
			}
			$scope.flag_min_payers = false;
			$scope.form_expense.payers.push({
				id : $scope.event_data.members[count_payers++].id,
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

		$scope.totalSpent = function(){
			var amount = 0.0;
			for (var i = 0; i < $scope.form_expense.payers.length; i++){
				amount += $scope.form_expense.payers[i].amount;
			}
			return amount;
		}

		$scope.remainingAmount = function(){
			var amount = 0.0;
			for (var i = 0; i < $scope.form_expense.payees.length; i++){
				if($scope.form_expense.payees[i].flag == true){
					amount += $scope.form_expense.payees[i].amount;
				}
			}
			return $scope.totalSpent()-amount;
		}

		var remainingPayees = function(){
			var count = 0;
			var payee;
			for (var i = 0; i < $scope.form_expense.payees.length; i++){
				payee = $scope.form_expense.payees[i];
				if(payee.flag == true && payee.amount<=0){
					count++;
				}
			}
			return count;
		}

		$scope.updatePayeesAmount = function(){
			if(remainingPayees() == 1){
				for (var i = 0; i < $scope.form_expense.payees.length; i++){
					if($scope.form_expense.payees[i].flag == true && $scope.form_expense.payees[i].amount==0){
						$scope.form_expense.payees[i].amount = $scope.remainingAmount();
					}
				}
			}
		}

		$scope.submitExpense = function(flag_add_another){
			if (flag_add_another==false && ($scope.form_expense.name == '' || $scope.form_expense.name === undefined)) {
				$state.go('edit',{slug:$scope.event_data.slug},{reload:true});
				return false;
			}
			if($scope.expenseForm.$valid && checkForTrue($scope.form_expense.payees)){
				var total_paid = 0.0,total_shared = 0.0;
				for (var i = 0; i < form_expense_master.payers.length; i++) {
					form_expense_master.payers[i].amount = 0;
				}
				form_expense_master.payees.splice(0);
				form_expense_master.name = $scope.form_expense.name;
				form_expense_master.added_by = $scope.form_expense.added_by;
				for (var i = 0; i < $scope.form_expense.payers.length; i++) {
					form_expense_master.payers[UtilsSrv.getIndexbyId(form_expense_master.payers,$scope.form_expense.payers[i].id)].amount += $scope.form_expense.payers[i].amount;
					total_paid += $scope.form_expense.payers[i].amount;
				}
				for (var i = 0; i < $scope.form_expense.payees.length; i++) {
					if($scope.form_expense.payees[i].flag == true){
						$scope.form_expense.payees[i].amount = +$scope.form_expense.payees[i].amount.toFixed(2);
						form_expense_master.payees.push($scope.form_expense.payees[i]);
						if (!$scope.flag_split_equally) {
							total_shared += $scope.form_expense.payees[i].amount;
						}
					}
				}

				if($scope.flag_split_equally){
					for (var i = 0; i < form_expense_master.payees.length; i++){
						form_expense_master.payees[i].amount = +(total_paid/(form_expense_master.payees.length)).toFixed(2);
						total_shared += +(form_expense_master.payees[i].amount).toFixed(2);
					}
				}

				total_shared = +total_shared.toFixed(2);
				total_paid = +total_paid.toFixed(2);

				var diff = +(total_shared-total_paid).toFixed(2);

				if(Math.abs(diff)<0.1){
					form_expense_master.payees[form_expense_master.payees.length-1].amount -= diff;
					total_shared -= diff;
				}

				if (total_paid != total_shared) {
					$rootScope.msg = 'Total paid and shared amounts do not match. Please double-check the amounts.';
					angular.element('#error_modal').modal('show');
					return false;
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
					else {
						$rootScope.msg = response.message;
						angular.element('#error_modal').modal('show');
					}
				}).error(function(response){
					$rootScope.msg = 'Unknown Error.';
					angular.element('#error_modal').modal('show');
				});
			}
			else {
				$scope.message = 'Invalid inputs.';
			}
		}

		$scope.removeExpense = function(exid){
			if (exid !== undefined) {
				var do_delete = $window.confirm('Are you absolutely sure you want to delete?');

				if(do_delete){
					EventSrv.deleteExpense($stateParams.slug,exid).success(function(response){
						if (response.success == true) {
							$state.go($state.current, {}, {reload: true});
						}
						else {
							$rootScope.msg = response.message;
							angular.element('#error_modal').modal('show');
						}
					}).error(function(response){
						$rootScope.msg = 'Could not delete expense.';
						angular.element('#error_modal').modal('show');
					});
				}
			}
		}
	}
	else {
		$rootScope.msg = 'Invalid URL.';
		angular.element('#error_modal').modal('show');
	}
}]);

