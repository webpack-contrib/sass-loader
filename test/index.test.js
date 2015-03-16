'use strict';

var should = require('should');
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var enhancedReqFactory = require('enhanced-require');

var CR = /\r/g;
var pathToSassLoader = path.resolve(__dirname, '../index.js');
var pathToErrorFileNotFound = path.resolve(__dirname, './scss/error-file-not-found.scss');
var pathToErrorFile = path.resolve(__dirname, './scss/error.scss');
var pathToErrorImport = path.resolve(__dirname, './scss/error-import.scss');

function readCss(ext, id) {
    return fs.readFileSync(path.join(__dirname, ext, id + '.css'), 'utf8').replace(CR, '');
}

function test(name, id) {
    ['scss', 'sass'].forEach(function forEachSyntaxStyle(ext) {
        it(name + ' (' + ext + ')', function (done) {
            var expectedCss = readCss(ext, id);
            var sassFile = 'raw!' +
                    pathToSassLoader + '?' +
                    (ext === 'sass'? '&indentedSyntax=sass' : '') + '!' +
                    path.join(__dirname, ext, id + '.' + ext);
            var enhancedReq;
            var actualCss;

            enhancedReq = enhancedReqFactory(module);

            // run synchronously
            actualCss = enhancedReq(sassFile);
            fs.writeFileSync(__dirname + '/output/' + name + '.' + ext + '.sync.css', actualCss, 'utf8');

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
                fs.writeFileSync(__dirname + '/output/' + name + '.' + ext + '.async.css', actualCss, 'utf8');
                actualCss.should.eql(expectedCss);

                done();
            });
        });
    });
}

describe('sass-loader', function () {

    describe('basic', function () {
        test('should compile simple sass without errors', 'language');
    });

    describe('imports', function () {
        test('should resolve imports correctly', 'imports');
        // Test for issue: https://github.com/jtangelder/sass-loader/issues/32
        test('should pass with multiple imports', 'multiple-imports');
    });

    describe('errors', function () {

        it('should output understandable errors in entry files', function () {
            try {
                enhancedReqFactory(module)(pathToSassLoader + '!' + pathToErrorFile);
            } catch (err) {
                // check for file excerpt
                err.message.should.match(/\.syntax-error{/);
                err.message.should.match(/Invalid property name/);
                err.message.should.match(/\(line 1, column 14\)/);
                err.message.indexOf(pathToErrorFile).should.not.equal(-1);
            }
        });

        it('should output understandable errors of imported files', function () {
            try {
                enhancedReqFactory(module)(pathToSassLoader + '!' + pathToErrorImport);
            } catch (err) {
                // check for file excerpt
                err.message.should.match(/\.syntax-error{/);
                err.message.should.match(/Invalid property name/);
                err.message.should.match(/\(line 1, column 14\)/);
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
