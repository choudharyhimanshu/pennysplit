
pennysplit.directive('loadingSpinner', ['$http' ,function ($http){
    return {
        restrict: 'A',
        link: function (scope, elm, attrs)
        {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (v)
            {
                if(v){
                    elm.show();
                }else{
                    elm.hide();
                }
            });
        }
    };
}]);

pennysplit.directive('subscribeForm', ['$http' ,function ($http){
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, elm, attrs)
        {
            elm.on('submit',function(){
                if(scope.email && scope.email != ''){
                    $http.post('/api/subscribe',{email : scope.email}).success(function(response){
                        scope.message = response.message;
                        scope.email = null;
                    })
                    .error(function(){
                        scope.email = null;
                        scope.message = 'Some error occurred. Please try again later.';
                    });
                }                
            });
        }
    };
}]);
