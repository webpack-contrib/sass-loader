'use strict';

var should = require('should');
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var enhancedReqFactory = require('enhanced-require');

var CR = /\r/g;
var syntaxStyles = ['scss', 'sass'];
var pathToSassLoader = path.resolve(__dirname, '../index.js');
var pathToErrorFileNotFound = path.resolve(__dirname, './scss/error-file-not-found.scss');
var pathToErrorFile = path.resolve(__dirname, './scss/error.scss');
var pathToErrorImport = path.resolve(__dirname, './scss/error-import.scss');

describe('sass-loader', function () {

    describe('basic', function () {

        testSync('should compile simple sass without errors (sync)', 'language');
        testAsync('should compile simple sass without errors (async)', 'language');

    });

    describe('imports', function () {

        testSync('should resolve imports correctly (sync)', 'imports');
        testAsync('should resolve imports correctly (async)', 'imports');

        // Test for issue: https://github.com/jtangelder/sass-loader/issues/32
        testSync('should pass with multiple imports (sync)', 'multiple-imports');
        testAsync('should pass with multiple imports (async)', 'multiple-imports');

        testSync('should resolve modules starting with an underscore (sync)', 'underscore-imports');
        testAsync('should resolve modules starting with an underscore (async)', 'underscore-imports');

        // Test for issue: https://github.com/jtangelder/sass-loader/issues/73
        testSync('should resolve imports from other language style correctly (sync)', 'import-other-style');
        testAsync('should resolve imports from other language style correctly (async)', 'import-other-style');

        // Test for includePath imports
        testSync('should resolve imports from another directory declared by includePaths correctly (sync)', 'import-include-paths');
        testAsync('should resolve imports from another directory declared by includePaths correctly (async)', 'import-include-paths');
    });

    describe('errors', function () {

        it('should output understandable errors in entry files', function () {
            try {
                enhancedReqFactory(module)(pathToSassLoader + '!' + pathToErrorFile);
            } catch (err) {
                // check for file excerpt
                err.message.should.match(/\.syntax-error''/);
                err.message.should.match(/Invalid top-level expression/);
                err.message.should.match(/\(line 1, column 1\)/);
                err.message.indexOf(pathToErrorFile).should.not.equal(-1);
            }
        });

        it('should output understandable errors of imported files', function () {
            try {
                enhancedReqFactory(module)(pathToSassLoader + '!' + pathToErrorImport);
            } catch (err) {
                // check for file excerpt
                err.message.should.match(/\.syntax-error''/);
                err.message.should.match(/Invalid top-level expression/);
                err.message.should.match(/\(line 1, column 1\)/);
                err.message.indexOf(pathToErrorFile).should.not.equal(-1);
            }
        });

        it('should output understandable errors when a file could not be found', function () {
            try {
                enhancedReqFactory(module)(pathToSassLoader + '!' + pathToErrorFileNotFound);
            } catch (err) {
                // check for file excerpt
                err.message.should.match(/@import "does-not-exist";/);
                err.message.should.match(/File to import not found or unreadable: does-not-exist\.scss/);
                err.message.should.match(/\(line 1, column 9\)/);
                err.message.indexOf(pathToErrorFileNotFound).should.not.equal(-1);
            }
        });

    });
});


function readCss(ext, id) {
    return fs.readFileSync(path.join(__dirname, ext, id + '.css'), 'utf8').replace(CR, '');
}

function testAsync(name, id) {
    syntaxStyles.forEach(function forEachSyntaxStyle(ext) {
        it(name + ' (' + ext + ')', function (done) {
            var expectedCss = readCss(ext, id);
            var sassFile = pathToSassFile(ext, id);
            var actualCss;

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
                fs.writeFileSync(__dirname + '/output/' + name + '.' + ext + '.async.css', actualCss, 'utf8');
                actualCss.should.eql(expectedCss);

                done();
            });
        });
    });
}

function testSync(name, id) {
    syntaxStyles.forEach(function forEachSyntaxStyle(ext) {
        it(name + ' (' + ext + ')', function () {
            var expectedCss = readCss(ext, id);
            var sassFile = pathToSassFile(ext, id);
            var enhancedReq = enhancedReqFactory(module);
            var actualCss = enhancedReq(sassFile);

            fs.writeFileSync(__dirname + '/output/' + name + '.' + ext + '.sync.css', actualCss, 'utf8');
            actualCss.should.eql(expectedCss);
        });
    });
}

function pathToSassFile(ext, id) {
    return 'raw!' +
        pathToSassLoader + '?' +
        (ext === 'sass'? '&indentedSyntax&' : '') + 'includePaths[]=' + path.join(__dirname, ext, 'from-include-path') + '!' +
        path.join(__dirname, ext, id + '.' + ext);
}
