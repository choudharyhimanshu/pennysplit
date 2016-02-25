
pennysplit.controller('WelcomeCtrl', ['$scope','$rootScope', function($scope,$rootScope){
	console.log('WelcomeCtrl');
}]);

pennysplit.controller('CreateCtrl', ['$scope', function($scope){

	var count_members = 0;

	$scope.new_member = '';

	$scope.create = {
		title : '',
		currency : 'INR',
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
		// do something
	};
	
}]);

pennysplit.controller('ViewCtrl', ['$rootScope','$stateParams', function($rootScope,$stateParams){
	$rootScope.slug = $stateParams.slug;
}]);

pennysplit.controller('EditCtrl', ['$rootScope','$stateParams', function($rootScope,$stateParams){
	$rootScope.slug = $stateParams.slug;
}]);