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

