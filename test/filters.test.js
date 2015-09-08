describe('Filters Test', function() {

  beforeEach(module('angularUtils.filters'));

  it('should zpad properly', inject(function(zpadFilter) {
    expect(zpadFilter(undefined, 2)).toBe('00');
    expect(zpadFilter(123, 5)).toBe('00123');
    expect(zpadFilter(123, 3)).toBe('123');
    expect(zpadFilter(123, 1)).toBe('123');
    expect(zpadFilter('123', 5)).toBe('00123');
    expect(zpadFilter('123', 3)).toBe('123');
    expect(zpadFilter('123', 1)).toBe('123');
    expect(zpadFilter('abc', 5)).toBe('00abc');
  }));

  it('should replace properly', inject(function(replaceFilter) {
    expect(replaceFilter('big cat', 'cat', 'dog')).toBe('big dog');
    expect(replaceFilter('big cat', 'dog', 'cat')).toBe('big cat');
    expect(replaceFilter('', 'dog', 'cat')).toBe('');
    expect(replaceFilter('dog', 'dog', '')).toBe('');
  }));

});
