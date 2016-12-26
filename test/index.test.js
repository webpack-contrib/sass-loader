"use strict";

Object.assign = Object.assign || require("object-assign");
require("should");

const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const merge = require("webpack-merge");
const customImporter = require("./tools/customImporter.js");
const customFunctions = require("./tools/customFunctions.js");
const pathToSassLoader = require.resolve("../index.js");
const sassLoader = require(pathToSassLoader);

const CR = /\r/g;
const syntaxStyles = ["scss", "sass"];
const pathToErrorFileNotFound = path.resolve(__dirname, "./scss/error-file-not-found.scss");
const pathToErrorFileNotFound2 = path.resolve(__dirname, "./scss/error-file-not-found-2.scss");
const pathToErrorFile = path.resolve(__dirname, "./scss/error.scss");
const pathToErrorImport = path.resolve(__dirname, "./scss/error-import.scss");

describe("sass-loader", () => {
    describe("basic", () => {
        testSync("should compile simple sass without errors (sync)", "language");
        testAsync("should compile simple sass without errors (async)", "language");
    });

    describe("config", () => {
        // Will be removed with webpack 2 support
        it.skip("should override sassLoader config with loader query", () => {
            // const expectedCss = readCss("sass", "language");
            // const webpackConfig = Object.assign({}, {
            //     entry: "raw!" + pathToSassLoader + "?indentedSyntax!" + path.join(__dirname, "sass", "language.sass"),
            //     sassLoader: {
            //         // Incorrect setting here should be overridden by loader query
            //         indentedSyntax: false
            //     }
            // });
            // let enhancedReq;
            // let actualCss;
            //
            // enhancedReq = enhancedReqFactory(module, webpackConfig);
            // const actualCss = enhancedReq(webpackConfig.entry);
            //
            // fs.writeFileSync(__dirname + "/output/should override sassLoader config with loader query.sass.sync.css", actualCss, "utf8");
            // actualCss.should.eql(expectedCss);
        });
    });

    describe("imports", () => {
        testSync("should resolve imports correctly (sync)", "imports");
        testAsync("should resolve imports correctly (async)", "imports");

        // Test for issue: https://github.com/jtangelder/sass-loader/issues/32
        testSync("should pass with multiple imports (sync)", "multiple-imports");
        testAsync("should pass with multiple imports (async)", "multiple-imports");

        // Test for issue: https://github.com/jtangelder/sass-loader/issues/73
        testSync("should resolve imports from other language style correctly (sync)", "import-other-style");
        testAsync("should resolve imports from other language style correctly (async)", "import-other-style");

        // Test for includePath imports
        testSync("should resolve imports from another directory declared by includePaths correctly (sync)", "import-include-paths", (ext) => {
            return {
                sassLoader: {
                    includePaths: [path.join(__dirname, ext, "from-include-path")]
                }
            };
        });
        testAsync("should resolve imports from another directory declared by includePaths correctly (async)", "import-include-paths", (ext) => {
            return {
                sassLoader: {
                    includePaths: [path.join(__dirname, ext, "from-include-path")]
                }
            };
        });

        testSync("should not resolve CSS imports (sync)", "import-css");
        testAsync("should not resolve CSS imports (async)", "import-css");

        testSync("should compile bootstrap-sass without errors (sync)", "bootstrap-sass");
        testAsync("should compile bootstrap-sass without errors (async)", "bootstrap-sass");
    });

    describe("custom importers", () => {
        testSync("should use custom importer", "custom-importer", () => {
            return {
                sassLoader: {
                    importer: customImporter
                }
            };
        });
        testAsync("should use custom importer", "custom-importer", () => {
            return {
                sassLoader: {
                    importer: customImporter
                }
            };
        });
    });

    describe("custom functions", () => {
        testSync("should expose custom functions", "custom-functions", () => {
            return {
                sassLoader: {
                    functions: customFunctions
                }
            };
        });
        testAsync("should expose custom functions", "custom-functions", () => {
            return {
                sassLoader: {
                    functions: customFunctions
                }
            };
        });
    });

    describe("prepending data", () => {
        testSync("should extend the data-option if present", "prepending-data", () => {
            return {
                sassLoader: {
                    data: "$prepended-data: hotpink;"
                }
            };
        });
        testAsync("should extend the data-option if present", "prepending-data", () => {
            return {
                sassLoader: {
                    data: "$prepended-data: hotpink;"
                }
            };
        });
    });

    describe("errors", () => {
        it("should throw an error in synchronous loader environments", () => {
            try {
                sassLoader.call({
                    async: Function.prototype
                }, "");
            } catch (err) {
                // check for file excerpt
                err.message.should.equal("Synchronous compilation is not supported anymore. See https://github.com/jtangelder/sass-loader/issues/333");
            }
        });

        it("should output understandable errors in entry files", (done) => {
            runWebpack({
                entry: pathToSassLoader + "!" + pathToErrorFile
            }, (err) => {
                err.message.should.match(/\.syntax-error''/);
                err.message.should.match(/Invalid CSS after/);
                err.message.should.match(/\(line 1, column 14\)/);
                err.message.indexOf(pathToErrorFile).should.not.equal(-1);
                done();
            });
        });

        it("should output understandable errors of imported files", (done) => {
            runWebpack({
                entry: pathToSassLoader + "!" + pathToErrorImport
            }, (err) => {
                // check for file excerpt
                err.message.should.match(/\.syntax-error''/);
                err.message.should.match(/Invalid CSS after "\.syntax-error''": expected "\{", was ""/);
                err.message.should.match(/\(line 1, column 14\)/);
                err.message.indexOf(pathToErrorFile).should.not.equal(-1);
                done();
            });
        });

        it("should output understandable errors when a file could not be found", (done) => {
            runWebpack({
                entry: pathToSassLoader + "!" + pathToErrorFileNotFound
            }, (err) => {
                err.message.should.match(/@import "does-not-exist";/);
                err.message.should.match(/File to import not found or unreadable: does-not-exist/);
                err.message.should.match(/\(line 1, column 1\)/);
                err.message.indexOf(pathToErrorFileNotFound).should.not.equal(-1);
                done();
            });
        });

        it("should not auto-resolve imports with explicit file names", (done) => {
            runWebpack({
                entry: pathToSassLoader + "!" + pathToErrorFileNotFound2
            }, (err) => {
                err.message.should.match(/@import "\.\/another\/_module\.scss";/);
                err.message.should.match(/File to import not found or unreadable: \.\/another\/_module\.scss/);
                err.message.should.match(/\(line 1, column 1\)/);
                err.message.indexOf(pathToErrorFileNotFound2).should.not.equal(-1);
                done();
            });
        });
    });
});

function readCss(ext, id) {
    return fs.readFileSync(path.join(__dirname, ext, "spec", id + ".css"), "utf8").replace(CR, "");
}

function testAsync(name, id, config) {
    syntaxStyles.forEach((ext) => {
        it(name + " (" + ext + ")", (done) => {
            const expectedCss = readCss(ext, id);
            const sassFile = pathToSassFile(ext, id);
            const baseConfig = merge({
                entry: sassFile,
                output: {
                    filename: "bundle." + ext + ".js"
                }
            }, config ? config(ext) : {});
            let actualCss;

            runWebpack(baseConfig, (err) => {
                if (err) {
                    done(err);
                    return;
                }

                delete require.cache[path.resolve(__dirname, "./output/bundle." + ext + ".js")];

                actualCss = require("./output/bundle." + ext + ".js");
                // writing the actual css to output-dir for better debugging
                fs.writeFileSync(path.join(__dirname, "output", Number(name) + "." + ext + ".async.css"), actualCss, "utf8");
                actualCss.should.eql(expectedCss);

                done();
            });
        });
    });
}

function testSync() {

}

function runWebpack(baseConfig, done) {
    const webpackConfig = merge({
        output: {
            path: path.join(__dirname, "output"),
            filename: "bundle.js",
            libraryTarget: "commonjs2"
        }
    }, baseConfig);

    webpack(webpackConfig, (err, stats) => {
        const notOk = err ||
            (stats.hasErrors && stats.compilation.errors[0]) ||
            (stats.hasWarnings && stats.compilation.warnings[0]);

        if (notOk) {
            done(notOk);
            return;
        }
        done();
    });
}

function pathToSassFile(ext, id) {
    return "raw!" + pathToSassLoader + "!" + path.join(__dirname, ext, id + "." + ext);
}
