'use strict';

var sass = require('node-sass');
var fs = require('fs');
var path = require('path');

var error = 'error';
var filesWithTildeImports = [
    'imports', 'underscore-imports', 'import-other-style'
];

['scss', 'sass'].forEach(function (ext) {
    var files = [];
    var basePath = path.join(__dirname, ext);
    var nodeModulesPath = path.join(__dirname, 'node_modules') + '/';

    fs.readdirSync(path.join(__dirname, ext))
        .filter(function (file) {
            return path.extname(file) === '.' + ext && file.slice(0, error.length) !== error;
        })
        .map(function (file) {
            var fileName = path.join(basePath, file);
            var fileWithoutExt = file.slice(0, -ext.length - 1);
            var fileContent;
            var css;

            if (filesWithTildeImports.indexOf(fileWithoutExt) > -1) {
                // We need to replace all occurrences of '~' with relative paths
                // so node-sass finds the imported files without webpack's resolving algorithm
                fileContent = fs.readFileSync(fileName, 'utf8');
                fileContent = fileContent.replace('~', nodeModulesPath);
                fs.writeFileSync(fileName, fileContent, 'utf8');
            }

            files.push(fileName);

            css = sass.renderSync({
                file: fileName,
                includePaths: [
                    path.join(__dirname, ext, 'another'),
                    path.join(__dirname, 'another', ext)
                ]
            }).css;

            if (filesWithTildeImports.indexOf(fileWithoutExt) > -1) {
                // Revert back our changes and add '~' again
                fileContent = fs.readFileSync(fileName, 'utf8');
                fileContent = fileContent.replace(nodeModulesPath, '~');
                fs.writeFileSync(fileName, fileContent, 'utf8');
            }

            return css;
        })
        .forEach(function (content, index) {
            fs.writeFileSync(files[index].replace(new RegExp('\\.' + ext + '$', 'gi'), '.css'), content, 'utf8');
        });
});
