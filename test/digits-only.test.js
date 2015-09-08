describe('OnlyDigits Test', function() {

  var element;

  beforeEach(module('angularUtils.digitsOnly'));
  beforeEach(function() {
    element = prepareElement('<input ng-model="field" digits-only>');
  });

  it('should accept only digits', function() {
    element.val('0Aa1b.;2-,3456789?');
    element.trigger('input');
    expect(element.val()).toBe('0123456789');
  });

});
