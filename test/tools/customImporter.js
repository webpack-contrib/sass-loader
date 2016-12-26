"use strict";

require("should");

function customImporter(path, prev) {
    path.should.equal("import-with-custom-logic");
    prev.should.match(/(sass|scss)[/\\]custom-importer\.(scss|sass)/);

    this.should.have.property("options"); // eslint-disable-line no-invalid-this

    return customImporter.returnValue;
}

customImporter.returnValue = {
    contents: ".custom-imported {}"
};

module.exports = customImporter;
