'use strict';

var should = require('should');
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');

var CR = /\r/g;

function readCss(ext, id) {
    return fs.readFileSync(path.join(__dirname, ext, id + '.css'), 'utf8').replace(CR, '');
}

function test(name, id, query) {
    it(name, function (done) {
        var exts = ['scss', 'sass'];
        var pending = exts.length;

        query = query || '';

        exts.forEach(function (ext) {
            var expectedCss = readCss(ext, id);
            var sassFile = 'raw!' +
                    path.resolve(__dirname, '../index.js') + '?' +
                    query +
                    (ext === 'sass'? '&indentedSyntax=sass' : '') + '!' +
                    path.join(__dirname, ext, id + '.' + ext);
            var actualCss;

            // run asynchronously
            webpack({
                entry: sassFile,
                output: {
                    path: __dirname + '/output',
                    filename: 'bundle.' + ext + '.js',
                    libraryTarget: 'commonjs2'
                }
            }, function onCompilationFinished(err, stats) {
                if (err) {
                    return done(err);
                }
                if (stats.hasErrors()) {
                    return done(stats.compilation.errors[0]);
                }
                if (stats.hasWarnings()) {
                    return done(stats.compilation.warnings[0]);
                }
                delete require.cache[path.resolve(__dirname, './output/bundle.' + ext + '.js')];

                actualCss = require('./output/bundle.' + ext + '.js');
                // writing the actual css to output-dir for better debugging
                //fs.writeFileSync(__dirname + '/output/' + name + '.' + ext + '.async.css', actualCss, 'utf8');
                actualCss.should.eql(expectedCss);

                pending--;
                if (pending === 0) {
                    done();
                }
            });
        });
    });
}

describe('sass-loader', function () {
    test('should compile simple sass without errors', 'language');
    test('should resolve imports correctly', 'imports');
    test('should pass the include paths to node-sass', 'include-paths',
        'includePaths[]=' + path.resolve(__dirname, './sass/another') + '&' +
        'includePaths[]=' + path.resolve(__dirname, './scss/another'));

    // Test for issue: https://github.com/jtangelder/sass-loader/issues/32
    test('should pass with multiple imports', 'multiple-imports')
});
