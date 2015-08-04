'use strict';

var sass = require('node-sass');
var fs = require('fs');
var path = require('path');

var testFolder = path.resolve(__dirname, '../');
var error = 'error';

function createSpec(ext) {
    var basePath = path.join(testFolder, ext);
    var testModulePath = path.relative(basePath, path.join(testFolder, 'node_modules', 'test-module'));

    fs.readdirSync(path.join(testFolder, ext))
        .filter(function (file) {
            return path.extname(file) === '.' + ext && file.slice(0, error.length) !== error;
        })
        .map(function (file) {
            var fileName = path.join(basePath, file);
            var fileWithoutExt = file.slice(0, -ext.length - 1);
            var css;

            css = sass.renderSync({
                file: fileName,
                importer: function (url) {
                    return {
                        file: url.replace(/^~test-module/, testModulePath)
                    };
                },
                includePaths: [
                    path.join(testFolder, ext, 'another'),
                    path.join(testFolder, ext, 'from-include-path')
                ]
            }).css;
            fs.writeFileSync(path.join(basePath, 'spec', fileWithoutExt + '.css'), css, 'utf8');
        });
}

module.exports = createSpec;
