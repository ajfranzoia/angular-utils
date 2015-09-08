/**
 * Digits only input
 */
angular.module('angularUtils.digitsOnly', [])

.directive('digitsOnly', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function (value) {
        var inputTransformed = value ? value.replace(/[^\d]/g,'') : null;

        if (inputTransformed != value) {
            ngModel.$setViewValue(inputTransformed);
            ngModel.$render();
        }

        return inputTransformed;
      });
    }
  }
});
