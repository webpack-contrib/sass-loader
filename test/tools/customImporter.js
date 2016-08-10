'use strict';

var should = require('should');

function customImporter(path, prev) {
    path.should.equal('import-with-custom-logic');
    prev.match(process.cwd() + '/test/(sass|scss)/custom-importer.(scss|sass)').should.not.equal(null);
    return customImporter.returnValue;
}
customImporter.returnValue = {
    contents: '.custom-imported {}'
};

module.exports = customImporter;
