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
