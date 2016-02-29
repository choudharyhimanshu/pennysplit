
pennysplit.controller('WelcomeCtrl', ['$scope','$rootScope', function($scope,$rootScope){
	console.log('WelcomeCtrl');
}]);

pennysplit.controller('CreateCtrl', ['$scope','$state','EventSrv', function($scope,$state,EventSrv){

	var count_members = 0;

	$scope.new_member = '';
	$scope.is_loading = false;
	$scope.create = {
		title : '',
		currency : 'INR',
		owner : '',
		members : []
	};

	$scope.$watch('new_member',function(){
		// do something
	});

	$scope.addMember = function(){
		if($scope.new_member && $scope.create.members.length < 50){
			$scope.create.members.push({
				id : count_members++,
				name : $scope.new_member
			});
			$scope.new_member = '';
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
					$state.go('edit',{slug:response.data.slug},{reload:true});
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
			$scope.form_expense = {
				name : '',
				payers : [{
					id : '',
					amount : ''
				}],
				payees : []
			};
			$scope.addPayer = function(){
				$scope.form_expense.payers.push({
					id : '',
					amount : ''
				});
			}
			$scope.removePayer = function(index){
				$scope.form_expense.payers.splice(index,1);
			}
			$scope.submitExpense = function(){
				if($scope.expenseForm.$valid){
					console.log($scope.form_expense);
					alert('submitted!');
				}
			}

			$scope.$watch('flag_mul_payer',function(newValue){
				if(newValue){
					$scope.form_expense.payers.push({
						id : '',
						amount : ''
					});
				}
				else {
					$scope.form_expense.payers = [$scope.form_expense.payers[0]];
				}
			});
		}).error(function(response){
			console.log(response);
		});
	}
	else {
		$scope.message = 'Invalid URL.';
	}
}]);