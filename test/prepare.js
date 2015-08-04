'use strict';

var sass = require('node-sass');
var fs = require('fs');
var path = require('path');

var error = 'error';
var filesWithTildeImports = [
    'imports', 'import-other-style', 'import-css'
];
var sassError;

['scss', 'sass'].forEach(function (ext) {
    var files = [];
    var basePath = path.join(__dirname, ext);
    var nodeModulesPath = path.join(__dirname, 'node_modules');
    var tildeReplacement = path.relative(basePath, nodeModulesPath) + '/';

    fs.readdirSync(path.join(__dirname, ext))
        .filter(function (file) {
            return path.extname(file) === '.' + ext && file.slice(0, error.length) !== error;
        })
        .map(function (file, i) {
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

            files.push(fileName);

            try {
                css = sass.renderSync({
                    file: fileName,
                    includePaths: [
                        path.join(__dirname, ext, 'another'),
                        path.join(__dirname, ext, 'from-include-path')
                    ]
                }).css;
                fs.writeFileSync(files[i].replace(new RegExp('\\.' + ext + '$', 'gi'), '.css'), css, 'utf8');
            } catch (err) {
                // Capture the sass error, but don't crash the script in order to roll-back all temporary file changes
                sassError = err;
            }

            if (filesWithTildeImports.indexOf(fileWithoutExt) > -1) {
                fs.writeFileSync(fileName, oldFileContent, 'utf8');
            }
        });
});

if (sassError) {
    // Now we throw the sass error to prevent the tests from being executed
    throw sassError;
}
