'use strict';

/**
 * This file can be used to track changes in the spec introduced by newer node-sass versions.
 * This can be useful to check if the tests need to be adjusted to new behavior.
 *
 * If you want to check if there are any changes, do this:
 *
 * 1. First, install the old version of node-sass
 * 2. Run `npm run create-spec`
 * 3. Now install the new version of node-sass
 * 4. Remove .skip( from describe-block in this file to activate the test
 * 5. Run `npm run test-spec`
 */

var should = require('should');
var fs = require('fs');
var path = require('path');
var createSpec = require('./tools/createSpec.js');

var testFolder = __dirname;
var matchCss = /\.css$/;

function readSpec(folder) {
    var result = {};

    fs.readdirSync(folder)
        .forEach(function (file) {
            if (matchCss.test(file)) {
                result[file] = fs.readFileSync(path.join(folder, file), 'utf8');
            }
        });

    return result;
}

function writeSpec(folder, spec) {
    Object.keys(spec)
        .forEach(function (specName) {
            fs.writeFileSync(path.resolve(folder, specName), spec[specName], 'utf8');
        });
}

['scss', 'sass'].forEach(function (ext) {

    describe.skip(ext + ' spec', function () {
        var specFolder = path.resolve(testFolder, ext, 'spec');
        var oldSpec;
        var newSpec;

        oldSpec = readSpec(specFolder);
        createSpec(ext);
        newSpec = readSpec(specFolder);

        Object.keys(oldSpec)
            .forEach(function (specName) {
                it(specName + ' should not have been changed', function () {
                    oldSpec[specName].should.eql(newSpec[specName]);
                });
            });

        after(function () {
            // Write old spec back to the folder so that future tests will also fail
            writeSpec(specFolder, oldSpec);
        });
    });

});
