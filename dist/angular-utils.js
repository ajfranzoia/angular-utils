/*
 * angular-utils
 * 
 * Version: 0.9.0 - 2015-09-07
 * License: MIT
 */
angular.module("angularUtils", ["angularUtils.ajaxLoader","angularUtils.apiResource","angularUtils.digitsOnly","angularUtils.filters","angularUtils.formUtils","angularUtils.monthPicker","angularUtils.paginationHeaders"]);

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

/**
 * Resource for api prefix calls and support for class/instance methods
 *
 * Usage:

app.config(['apiResourceProvider', function(apiResourceProvider) {
  apiResourceProvider.setBaseUrl('/my-api') // defaults to '/api'
});

app.factory('MyResource', ['apiResource', function(apiResource) {

  var MyResource = apiResource('posts', {id: '@id'}, {
    // angular resource methods
    methodA: {
      resourceUrl: '/', // url relative to resource api url, will result in /posts/:id
    },
    methodB: {
      url: '/', // url relative to root
    }
  },
  {
    // class methods different than angular ones (eg with use of $http)
  },
  {
    // instance methods
  });

  return MyResource;
}]);

 */
angular.module('angularUtils.apiResource', ['ngResource'])

.provider('apiResource', function () {

  // Base url for resource calls, e.g. /api
  var defaultBaseUrl = '/api';

  return {

    setBaseUrl: function (value) {
      defaultBaseUrl = value;
    },

    getBaseUrl: function () {
      return defaultBaseUrl;
    },

    $get: ['$resource', function ($resource) {
      return function(resourceBase, paramDefaults, actions, collectionMethods, instanceMethods) {
        if (typeof resourceBase == 'undefined' || resourceBase == null) {
          throw 'Resource URL can\'t be empty';
        }

        actions = (actions || {});
        instanceMethods = (instanceMethods || {});
        collectionMethods = (collectionMethods || {});

        var resBaseUrl;
        if (typeof resourceBase == 'object') {
          // Override base url
          resBaseUrl = resourceBase.baseUrl ? resourceBase.baseUrl : defaultBaseUrl;
          resourceBase = resourceBase.name;
        } else {
          resBaseUrl = defaultBaseUrl;
        }

        if (resBaseUrl.charAt(0) != '/') {
          throw 'Resource base url must start with "/"';
        }

        for (var key in actions) {
          if (['get', 'save', 'query', 'remove', 'delete'].indexOf(key) != -1) {
            // Exlude default actions
            continue;
          }

          if (!actions[key].url && !actions[key].resourceUrl) {
            actions[key].url = resBaseUrl + '/' + resourceBase + '/' + key + '/:id';
          } else {
            if (actions[key].resourceUrl) {
              actions[key].url = resBaseUrl + '/' + resourceBase + (actions[key].resourceUrl == '/' ? actions[key].resourceUrl : '/' + actions[key].resourceUrl);
              delete actions[key].resourceUrl;
            }
          }
        }

        var defaultInstanceMethods = {
          $save: function() {
            if (!this.id) {
              return this.$create();
            } else {
              return this.$update();
            }
          },
        };
        instanceMethods = angular.extend(defaultInstanceMethods, instanceMethods);

        var defaultActions = {
          'get': {method: 'GET'},
          'save': {method: 'POST'},
          'query': {method: 'GET', isArray: true},
          'remove': {method: 'DELETE'},
          'delete': {method: 'DELETE'},
          'update': {method: 'PUT', isArray: false},
          'create': {method: 'POST'}
        };

        actions = angular.extend(defaultActions, actions);

        var resource = $resource(resBaseUrl + '/' + resourceBase + '/:id', paramDefaults, actions);
        angular.extend(resource, collectionMethods);
        angular.extend(resource.prototype, instanceMethods);

        resource.url = function () {
          return resBaseUrl + '/' + resourceBase;
        }

        resource.getParamDefaults = function () {
          return paramDefaults;
        }

        resource.getActions = function () {
          return actions;
        }

        return resource;
      }
    }]

  };
});

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

/**
 * Useful filters
 */
angular.module('angularUtils.filters', [])

/**
 * Zero left pad number
 * Usage: 9 | zpad:2 => '09'
 */
.filter('zpad', function() {
  return function(input, n) {
    if (typeof input == 'undefined') {
      input = '';
    } else if (typeof input == 'number') {
      input = input.toString();
    }

    if(input.length >= n) {
      return input;
    }
    var zeros = '0'.repeat(n);

    return (zeros + input).slice(-1 * n);
  };
})

/**
 * Replace part in string
 * Usage: 'fromhere' | replace:'from':'to' => 'tohere'
 */
.filter('replace', function() {
  return function(input, find, replace) {
    return input.replace(new RegExp(find, 'g'), replace);
  };
})


/**
 * Form utils
 */
angular.module('angularUtils.formUtils', [])

/**
 * Save labels, useful to show in error message
 */
.directive('storeLabels', [function() {
  return {
    restrict: 'AC',
    require: '^form',
    link: function(scope, $el, attrs, ngModel){
      var labels = {};

      $el.find('[name]').each(function(i, el) {
        var $input = $(el);
        labels[$input.attr('name')] = $input.closest('.form-group').find('.control-label').text();
      });

      scope.$inputLabels = labels;
    }
  };
}])

/**
 * Adds 'required' class to .form-group elements that contain required inputs
 */
.directive('markRequired', [function() {
  return {
    restrict: 'AC',
    require: '^form',
    link: function(scope, $el, attrs, formCtrl) {
      $el.find('[required]').each(function(i, input) {
        $(input).closest('.form-group').addClass('required');
      });
    }
  };
}])

/**
 * Adds ng-messages attributes to all inputs
 * Requires https://github.com/paulyoder/angular-bootstrap-show-errors
 * Usage <form name="testForm" form-show-errors="/url/for/error-messages.html"
 */
.directive('formShowErrors', ['$compile', function($compile) {

  var compileFn = function (formEl, attrs) {

      var formName = formEl.attr('name') ? formEl.attr('name') : formEl.attr('ng-form');
      if (!formName) {
        throw 'Form has no "name" or "ng-form" attribute';
      }

    // Add ngMessages to form controls
    formEl.find('.form-control[name]').each(function(i, val) {
      var input = $(val),
          name = input.attr('name'),
          formGroup = input.closest('.form-group');

      // Add showErrors to form groups
      formGroup.attr('show-errors', true);

      var msgElName = formName + '.' + name;
      var msgsEl = $('<div/>').addClass('help-block').attr({
        'ng-messages': msgElName + '.$error',
        'ng-messages-include': attrs.formShowErrors,
        //'ng-messages-multiple': '',
        'ng-show': msgElName + '.$touched && ' + msgElName + '.$invalid'
      });

      var container = formGroup.find('[errors-container=' + name + ']');
      if (!container.length) {
        container = formGroup.find('.errors-container, [errors-container]');
      }

      if (container.length) {
        container.html(msgsEl);
      } else {
        input.after(msgsEl);
      }
    });
  }

  return {
    restrict: 'A',
    require: '^form',
    compile: compileFn
  };
}])

.directive('validFile', [function() {
  return {
    require:'ngModel',
    link:function(scope,el,attrs,ngModel){
      // Change event is fired when file is selected
      el.bind('change',function(){
        scope.$apply(function() {
          ngModel.$setViewValue(el[0].files.length ? el[0].files[0] : null);
          ngModel.$render();
        });
      });
    }
  }
}]);

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
