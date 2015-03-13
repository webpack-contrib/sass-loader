'use strict';

var sass = require('node-sass');
var fs = require('fs');
var path = require('path');

['scss', 'sass'].forEach(function (ext) {
    var files = [];
    var basePath = path.join(__dirname, ext);

    fs.readdirSync(path.join(__dirname, ext))
        .filter(function (file) {
            return path.extname(file) === '.' + ext;
        })
        .map(function (file) {
            var fileName = path.join(basePath, file);
            var fileContent;
            var css;

            if (file === 'imports.' + ext) {
                // We need to replace all occurrences of '~' with relative paths
                // so node-sass finds the imported files without webpack's resolving algorithm
                fileContent = fs.readFileSync(fileName, 'utf8');
                fileContent = fileContent.replace('~', '../node_modules/');
                fs.writeFileSync(fileName, fileContent, 'utf8');
            }

            files.push(fileName);

            css = sass.renderSync({
                file: fileName,
                includePaths: [
                    path.join(__dirname, ext, 'another')
                ]
            }).css;

            if (file === 'imports.' + ext) {
                // Revert back our changes and add '~' again
                fileContent = fs.readFileSync(fileName, 'utf8');
                fileContent = fileContent.replace('../node_modules/', '~');
                fs.writeFileSync(fileName, fileContent, 'utf8');
            }

            return css;
        })
        .forEach(function (content, index) {
            fs.writeFileSync(files[index].replace(new RegExp('\\.' + ext + '$', 'gi'), '.css'), content, 'utf8');
        });
});
