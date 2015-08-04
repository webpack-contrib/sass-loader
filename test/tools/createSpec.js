'use strict';

var sass = require('node-sass');
var fs = require('fs');
var path = require('path');

var testFolder = path.resolve(__dirname, '../');
var error = 'error';
var filesWithTildeImports = [
    'imports', 'import-other-style', 'import-css'
];

function createSpec(ext) {
    var basePath = path.join(testFolder, ext);
    var nodeModulesPath = path.join(testFolder, 'node_modules');
    var tildeReplacement = path.relative(basePath, nodeModulesPath) + path.sep;
    var sassError;

    fs.readdirSync(path.join(testFolder, ext))
        .filter(function (file) {
            return path.extname(file) === '.' + ext && file.slice(0, error.length) !== error;
        })
        .map(function (file) {
            var fileName = path.join(basePath, file);
            var fileWithoutExt = file.slice(0, -ext.length - 1);
            var oldFileContent;
            var newFileContent;
            var css;

            if (filesWithTildeImports.indexOf(fileWithoutExt) > -1) {
                // We need to replace all occurrences of '~' with relative paths
                // so node-sass finds the imported files without webpack's resolving algorithm
                oldFileContent = fs.readFileSync(fileName, 'utf8');
                newFileContent = oldFileContent.replace(/~/g, tildeReplacement);
                fs.writeFileSync(fileName, newFileContent, 'utf8');
            }

            try {
                css = sass.renderSync({
                    file: fileName,
                    includePaths: [
                        path.join(testFolder, ext, 'another'),
                        path.join(testFolder, ext, 'from-include-path')
                    ]
                }).css;
                fs.writeFileSync(path.join(basePath, 'spec', fileWithoutExt + '.css'), css, 'utf8');
            } catch (err) {
                // Capture the sass error, but don't crash the script in order to roll-back all temporary file changes
                sassError = err;
            }

            if (filesWithTildeImports.indexOf(fileWithoutExt) > -1) {
                fs.writeFileSync(fileName, oldFileContent, 'utf8');
            }
        });

    if (sassError) {
        // Now we can throw the sass error
        throw sassError;
    }
}

module.exports = createSpec;
