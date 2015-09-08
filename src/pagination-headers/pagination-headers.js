/**
 * Pagination headers to use together with other pagination directives
 */
angular.module('angularUtils.pagination', [])

.directive('paginationHeaders', function ($rootScope) {

  return {
    template:
      '\
      <th ng-repeat="column in processedColumns" class="{{column.class}}">\
        <a ng-click="sort(column)" ng-if="column.sort">\
          {{column.label}}\
          <i class="fa fa-{{sortUpIcon}} pull-right" ng-show="column.active && column.direction==\'asc\'"></i>\
          <i class="fa fa-{{sortDownIcon}} pull-right" ng-show="column.active && column.direction==\'desc\'"></i>\
        </a>\
        <span ng-if="!column.sort">{{column.label}}</span>\
      </th>\
      ',
    scope: {
      columns: '=',
      sortFn: '&',
      sortUpIcon: '=?',
      sortDownIcon: '=?',
    },
    link: function ($scope, element, attrs) {

      $scope.sortUpIcon = $scope.sortUpIcon || 'caret-up';
      $scope.sortDownIcon = $scope.sortDownIcon || 'caret-down';

      $scope.processedColumns = $scope.columns.map(function(column) {
        if (!column.label) {
          column.label = column.id.charAt(0).toUpperCase() + column.id.slice(1);
        }

        if (!column.class) {
          column.class = 'column-' + column.id;
        }

        column.direction = null;
        column.active = false;

        return column;
      });

      $scope.sort = function (column) {
        $scope.processedColumns.forEach(function(_column) {
          _column.active = false;
        });
        column.active = true;
        column.direction = column.direction === null ? 'asc' : (column.direction == 'asc' ? 'desc' : 'asc');
        $scope.sortFn({config: {sort: column.id, direction: column.direction}});
      }
    }
  };

});
