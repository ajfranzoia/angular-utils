/**
 * Ajax loader
 */
angular.module('angularUtils.ajaxLoader', [])

.directive('ajaxLoader', function directive() {
  return {
    template: '<div class="ajax-loader-container" ng-show="showLoader"><div class="ajax-loader"></div></div>',
    scope: {},
    link: function ($scope, element, attrs) {
      $scope.showLoader = false;

      $scope.$on('ajax-loader:show', function () {
        $scope.showLoader = true;
      });

      $scope.$on('ajax-loader:hide', function () {
        $scope.showLoader = false;
      });

      return $scope;
    }
  };
})

.factory('httpInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
  var numRequests = 0;

  var isDisabled = function(config) {
    // Allow disabling via headers (useful for resources)
    if (config.headers && config.headers.ajaxLoader === false) {
      delete config.headers.ajaxLoader;
      config.ajaxLoader = false;
    }
    if (config.ajaxLoader === false) {
      return true;
    }

    return false;
  };

  return {
    request: function (config) {
      if (!isDisabled(config)) {
        numRequests++;
        $rootScope.$broadcast('ajax-loader:show');
      }

      return config || $q.when(config);
    },
    response: function (response) {
      if (!isDisabled(response.config) && (--numRequests) === 0) {
        $rootScope.$broadcast('ajax-loader:hide');
      }

      return response || $q.when(response);
    },
    responseError: function (response) {
      if (!isDisabled(response.config) && (--numRequests) === 0) {
        $rootScope.$broadcast('ajax-loader:hide');
      }

      return $q.reject(response);
    }
  };
}])

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('httpInterceptor');
});
