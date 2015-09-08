describe('AjaxLoader Test', function() {

  var $httpBackend, $http, element, loaderContainer;

  beforeEach(module('angularUtils.ajaxLoader'));
  beforeEach(inject(function(_$httpBackend_, _$http_) {
    $httpBackend = _$httpBackend_;
    $http = _$http_;
    element = prepareElement('<ajax-loader></ajax-loader>');
    loaderContainer = element.find('.ajax-loader-container');
  }));

  var assertHidden = function() {
    expect(loaderContainer.hasClass('ng-hide')).toBeTruthy();
  }
  var assertShown = function() {
    expect(loaderContainer.hasClass('ng-hide')).toBeFalsy();
  }

  it('should have the expected html', function() {
    var expectedHtml = '<div class="ajax-loader-container ng-hide" ng-show="showLoader"><div class="ajax-loader"></div></div>';
    expect(element.html()).toBe(expectedHtml);
  });

  it('should be hidden on ajax request', function() {
    $httpBackend.when('GET', "/request").respond(200);
    $http.get('/request').then(function(response) {
      assertShown(); // $digest cycle not finished, check here element status
    });

    assertHidden();
    $httpBackend.flush();
    assertHidden(); // $digest finished, check element status again
  });

  it('should be hidden on unsuccessful ajax request', function() {
    $httpBackend.when('GET', "/request-error").respond(400);
    $http.get('/request-error').then(null, function(response) {
      assertShown();
    });

    assertHidden();
    $httpBackend.flush();
    assertHidden();
  });

  it('should be hidden during multiple ajax requests', function() {
    $httpBackend.when('GET', "/request").respond(200);
    $httpBackend.when('GET', "/request-error").respond(400);

    $http.get('/request').then(function(response) {
      assertShown();
    });
    $http.get('/request-error').then(null, function(response) {
      assertShown();
    });
    $http.get('/request').then(function(response) {
      assertShown();
    });

    assertHidden();
    $httpBackend.flush();
    assertHidden();
  });

});
