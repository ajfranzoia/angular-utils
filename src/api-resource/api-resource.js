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
