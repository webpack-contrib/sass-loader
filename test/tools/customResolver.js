'use strict';

require('should');

function customResolver(path, prev) {
  path.should.equal('import-with-custom-resolver');
  prev.should.match(/(sass|scss)[/\\]custom-resolver\.(scss|sass)/);

  this.should.have.property('options'); // eslint-disable-line no-invalid-this

  return customResolver.returnValue;
}

customResolver.returnValue = {
  contents: '.custom-resolver {}',
};

module.exports = customResolver;
