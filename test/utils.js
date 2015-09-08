window.prepareElement = function (template) {
  var elem;
  inject(function ($compile, $rootScope) {
    elem = $compile(template)($rootScope);
    $rootScope.$digest();
  });
  return elem;
};
