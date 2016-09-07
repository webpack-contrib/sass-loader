'use strict';

var should = require('should');

function customImporter(path, prev) {
    /*jshint validthis: true */
    
    path.should.equal('import-with-custom-logic');
    prev.should.match(/(sass|scss)[/\\]custom-importer\.(scss|sass)/);
    
    this.should.have.property('options');
    
    return customImporter.returnValue;
}
customImporter.returnValue = {
    contents: '.custom-imported {}'
};

module.exports = customImporter;
