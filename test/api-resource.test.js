describe('ApiResource Tests', function() {

  var provider, service;

  beforeEach(function() {
    module('angularUtils.apiResource', function(apiResourceProvider) {
      provider = apiResourceProvider;
    });
  });

  beforeEach(inject(function(apiResource) {
    service = apiResource;
  }));

  it('should test provider internal functions and resource generation', inject(function($injector) {
    inject(function(apiResource) {
      expect(apiResource('posts').url()).toBe('/api/posts');
    });
    provider.setBaseUrl('/api-test');
    expect(provider.getBaseUrl()).toBe('/api-test');
    inject(function(apiResource) {
      expect(apiResource('posts').url()).toBe('/api-test/posts');
    });
  }));

  it('should generate urls properly', inject(function(apiResource) {
    var posts = apiResource('posts');
    expect(posts.url()).toBe('/api/posts');

    posts = apiResource({name: 'posts'});
    expect(posts.url()).toBe('/api/posts');

    // Override default base url
    posts = apiResource({baseUrl: '/api-legacy', name: 'posts'});
    expect(posts.url()).toBe('/api-legacy/posts');
  }));

  it('should generate actions', inject(function(apiResource) {
    var posts = apiResource('posts');
    expect(posts.getActions()).toEqual({
      'get': {method: 'GET'},
      'save': {method: 'POST'},
      'query': {method: 'GET', isArray: true},
      'remove': {method: 'DELETE'},
      'delete': {method: 'DELETE'},
      'update': {method: 'PUT', isArray: false},
      'create': {method: 'POST'}
    });

    // Custom action
    posts = apiResource('posts', {}, {'lock': {method: 'POST'}});
    expect(posts.getActions().lock.url).toBe('/api/posts/lock/:id');

    // Custom action with custom generated url
    posts = apiResource('posts', {}, {'unlock': {method: 'POST', resourceUrl: 'unlock_version2'}});
    expect(posts.getActions().unlock.url).toBe('/api/posts/unlock_version2');

    // Custom action with overriden url
    posts = apiResource('posts', {}, {'unlock': {method: 'POST', url: '/api-legacy/posts_v1/unlock'}});
    expect(posts.getActions().unlock.url).toBe('/api-legacy/posts_v1/unlock');
  }));

  it('should attach instance and collection methods', inject(function(apiResource) {
    var posts = apiResource('posts', null, null, {myCollectionMethod: function () {}}, {myInstanceMethod: function () {}});
    expect(posts.myCollectionMethod).toBeDefined();
    expect(posts.prototype.myInstanceMethod).toBeDefined();
    expect((new posts).myInstanceMethod).toBeDefined();
  }));

});
