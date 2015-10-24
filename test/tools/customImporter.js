'use strict';

var should = require('should');

function customImporter(path) {
    path.should.equal('import-with-custom-logic');
    return customImporter.returnValue;
}
customImporter.returnValue = {
    contents: '.custom-imported {}'
};

module.exports = customImporter;
