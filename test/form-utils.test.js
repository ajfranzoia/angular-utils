describe('FormUtils Test', function() {

  beforeEach(module('angularUtils.formUtils'));

  it('should save input labels', function() {
    var form = prepareElement('\
      <form store-labels> \
        <div class="form-group"> \
          <label class="control-label">Field 1</label> \
          <input type="text" name="field1"> \
        </div> \
        <div class="form-group"> \
          <label class="control-label">Field 2</label> \
          <input type="text" name="field2"> \
        </div> \
      </form>');
    expect(form.scope().$inputLabels).toEqual({field1: 'Field 1', field2: 'Field 2'});
  });

  it('should mark required form groups', function() {
    var form = prepareElement('\
      <form mark-required> \
        <div class="form-group"> \
          <input type="text" required> \
        </div> \
        <div class="form-group"> \
          <input type="text"> \
        </div> \
      </form>');
    expect(form.find('.form-group:eq(0)').hasClass('required')).toBeTruthy();
    expect(form.find('.form-group:eq(1)').hasClass('required')).toBeFalsy();
  });

  it('should add error messages directives', function() {
    var form = prepareElement('\
      <form name="testForm" form-show-errors="/error-messsages.html"> \
        <div class="form-group"> \
          <input class="form-control" ng-model="input1" name="input1"> \
        </div> \
      </form>');

    //expect(form.attr('show-errors')):

    var formGroup = form.find('.form-group');
    var input = form.find('input');

    expect(formGroup.attr('show-errors')).toBe('true');
    expect(formGroup.find('div.help-block').length).toBe(1);
    var helpBlock = formGroup.find('div.help-block');
    expect(helpBlock.attr('ng-messages')).toBe('testForm.input1.$error');
    expect(helpBlock.attr('ng-messages-include')).toBe('/error-messsages.html');
    expect(helpBlock.attr('ng-show')).toBe('testForm.input1.$touched && testForm.input1.$invalid');
  });

  it('should add error messages directives in container', function() {
    var form = prepareElement('\
      <form name="testForm" form-show-errors="/error-messsages.html"> \
        <div class="form-group"> \
          <input class="form-control" ng-model="input1" name="input1"> \
          <div class="errors-container"></div> \
        </div> \
      </form>');

    //expect(form.attr('show-errors')):

    var formGroup = form.find('.form-group');
    var input = form.find('input');

    expect(formGroup.attr('show-errors')).toBe('true');
    expect(formGroup.find('.errors-container div.help-block').length).toBe(1);
    var helpBlock = formGroup.find('.errors-container div.help-block');
    expect(helpBlock.attr('ng-messages')).toBe('testForm.input1.$error');
    expect(helpBlock.attr('ng-messages-include')).toBe('/error-messsages.html');
    expect(helpBlock.attr('ng-show')).toBe('testForm.input1.$touched && testForm.input1.$invalid');
  });

});
