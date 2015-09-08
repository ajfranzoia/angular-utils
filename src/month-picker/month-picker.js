/**
 * Bootstrap month picker tht uses FontAwesome icons
 * Extends and requires eonasdan-bootstrap-datetimepicker
 */
angular.module('angularUtils.monthPicker', [])

.directive('monthPicker', ['$timeout', 'moment', function($timeout, moment) {
  return {
    restrict: 'A',
    require : 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      var dp = $(element).datetimepicker({
        format: 'MM/YYYY',
        viewMode: 'years',
        icons: {
          time: 'fa fa-time',
          date: 'fa fa-calendar',
          up: 'fa fa-chevron-up',
          down: 'fa fa-chevron-down',
          previous: 'fa fa-chevron-left',
          next: 'fa fa-chevron-right',
          today: 'fa fa-screenshot',
          clear: 'fa fa-trash'
        },
      }).on('dp.change', function(e) {
        ngModel.$setViewValue(e.date.format('YYYYMM'));
        scope.$apply();
      });

      scope.$watch(function(){
        return ngModel.$modelValue;
      }, function(modelValue){
        $timeout(function() {
          dp.data('DateTimePicker').date(moment(modelValue, 'YYYYMM'));
        })
      });
    }
  };
}]);
