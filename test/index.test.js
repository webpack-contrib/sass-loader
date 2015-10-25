'use strict';

Object.assign = Object.assign || require('object-assign');

var should = require('should');
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var enhancedReqFactory = require('enhanced-require');
var customImporter = require('./tools/customImporter.js');
var customFunctions = require('./tools/customFunctions.js');

var CR = /\r/g;
var syntaxStyles = ['scss', 'sass'];
var pathToSassLoader = path.resolve(__dirname, '../index.js');
var pathToErrorFileNotFound = path.resolve(__dirname, './scss/error-file-not-found.scss');
var pathToErrorFileNotFound2 = path.resolve(__dirname, './scss/error-file-not-found-2.scss');
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

        // Test for issue: https://github.com/jtangelder/sass-loader/issues/73
        testSync('should resolve imports from other language style correctly (sync)', 'import-other-style');
        testAsync('should resolve imports from other language style correctly (async)', 'import-other-style');

        // Test for includePath imports
        testSync('should resolve imports from another directory declared by includePaths correctly (sync)', 'import-include-paths', function (ext) {
            return {
                sassLoader: {
                    includePaths: [path.join(__dirname, ext, 'from-include-path')]
                }
            };
        });
        testAsync('should resolve imports from another directory declared by includePaths correctly (async)', 'import-include-paths', function (ext) {
            return {
                sassLoader: {
                    includePaths: [path.join(__dirname, ext, 'from-include-path')]
                }
            };
        });

        testSync('should not resolve CSS imports (sync)', 'import-css');
        testAsync('should not resolve CSS imports (async)', 'import-css');

        testSync('should prefer _.scss over _.sass (sync)', 'import-order-1');
        testAsync('should prefer _.scss over _.sass (async)', 'import-order-1');
        testSync('should prefer _.sass over _.css (sync)', 'import-order-2');
        testAsync('should prefer _.sass over _.css (async)', 'import-order-2');
        testSync('should prefer _.css over .scss (sync)', 'import-order-3');
        testAsync('should prefer _.css over .scss (async)', 'import-order-3');
        testSync('should prefer .scss over .sass (sync)', 'import-order-4');
        testAsync('should prefer .scss over .sass (async)', 'import-order-4');
        testSync('should prefer .sass over .css (sync)', 'import-order-5');
        testAsync('should prefer .sass over .css (async)', 'import-order-5');
        testSync('should prefer explicit imports over auto-resolving (sync)', 'import-order-6');
        testAsync('should prefer explicit imports over auto-resolving (async)', 'import-order-6');

        testSync('should compile bootstrap-sass without errors (sync)', 'bootstrap-sass');
        testAsync('should compile bootstrap-sass without errors (async)', 'bootstrap-sass');
    });

    describe('custom importers', function () {

        testSync('should use custom importer', 'custom-importer', function () {
            return {
                sassLoader: {
                    importer: customImporter
                }
            };
        });
        testAsync('should use custom importer', 'custom-importer', function () {
            return {
                sassLoader: {
                    importer: customImporter
                }
            };
        });

    });

    describe('custom functions', function () {

        testSync('should expose custom functions', 'custom-functions', function () {
            return {
                sassLoader: {
                    functions: customFunctions
                }
            };
        });
        testAsync('should expose custom functions', 'custom-functions', function () {
            return {
                sassLoader: {
                    functions: customFunctions
                }
            };
        });

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
                err.message.should.match(/File to import not found or unreadable: does-not-exist/);
                err.message.should.match(/\(line 1, column 9\)/);
                err.message.indexOf(pathToErrorFileNotFound).should.not.equal(-1);
            }
        });

        it('should not auto-resolve imports with explicit file names', function () {
            try {
                enhancedReqFactory(module)(pathToSassLoader + '!' + pathToErrorFileNotFound2);
            } catch (err) {
                // check for file excerpt
                err.message.should.match(/@import "\.\/another\/_module\.scss";/);
                err.message.should.match(/File to import not found or unreadable: \.\/another\/_module\.scss/);
                err.message.should.match(/\(line 1, column 9\)/);
                err.message.indexOf(pathToErrorFileNotFound2).should.not.equal(-1);
            }
        });

    });
});


function readCss(ext, id) {
    return fs.readFileSync(path.join(__dirname, ext, 'spec', id + '.css'), 'utf8').replace(CR, '');
}

function testAsync(name, id, config) {
    syntaxStyles.forEach(function forEachSyntaxStyle(ext) {
        it(name + ' (' + ext + ')', function (done) {
            var expectedCss = readCss(ext, id);
            var sassFile = pathToSassFile(ext, id);
            var webpackConfig = Object.assign(config ? config(ext) : {}, {
                entry: sassFile,
                output: {
                    path: __dirname + '/output',
                    filename: 'bundle.' + ext + '.js',
                    libraryTarget: 'commonjs2'
                }
            });
            var actualCss;

            webpack(webpackConfig, function onCompilationFinished(err, stats) {
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

function testSync(name, id, config) {
    syntaxStyles.forEach(function forEachSyntaxStyle(ext) {
        it(name + ' (' + ext + ')', function () {
            var expectedCss = readCss(ext, id);
            var sassFile = pathToSassFile(ext, id);
            var webpackConfig = Object.assign(config ? config(ext) : {}, {
                entry: sassFile
            });
            var enhancedReq;
            var actualCss;

            enhancedReq = enhancedReqFactory(module, webpackConfig);
            actualCss = enhancedReq(webpackConfig.entry);

            fs.writeFileSync(__dirname + '/output/' + name + '.' + ext + '.sync.css', actualCss, 'utf8');
            actualCss.should.eql(expectedCss);
        });
    });
}

function pathToSassFile(ext, id) {
    return 'raw!' + pathToSassLoader + '?' + (ext === 'sass'? 'indentedSyntax' : '') + '!' + path.join(__dirname, ext, id + '.' + ext);
}
