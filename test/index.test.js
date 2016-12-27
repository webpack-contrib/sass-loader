"use strict";

require("should");

const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const merge = require("webpack-merge");
const customImporter = require("./tools/customImporter.js");
const customFunctions = require("./tools/customFunctions.js");
const pathToSassLoader = require.resolve("../lib/loader.js");
const sassLoader = require(pathToSassLoader);

const CR = /\r/g;
const syntaxStyles = ["scss", "sass"];
const pathToErrorFileNotFound = path.resolve(__dirname, "./scss/error-file-not-found.scss");
const pathToErrorFileNotFound2 = path.resolve(__dirname, "./scss/error-file-not-found-2.scss");
const pathToErrorFile = path.resolve(__dirname, "./scss/error.scss");
const pathToErrorImport = path.resolve(__dirname, "./scss/error-import.scss");

syntaxStyles.forEach(ext => {
    function execTest(testId, options) {
        return new Promise((resolve, reject) => {
            const baseConfig = merge({
                entry: path.join(__dirname, ext, testId + "." + ext),
                output: {
                    filename: "bundle." + ext + ".js"
                },
                module: {
                    rules: [{
                        test: new RegExp(`\\.${ ext }$`),
                        use: [
                            { loader: "raw-loader" },
                            { loader: pathToSassLoader, options }
                        ]
                    }]
                }
            });

            runWebpack(baseConfig, (err) => err ? reject(err) : resolve());
        }).then(() => {
            delete require.cache[path.resolve(__dirname, "./output/bundle." + ext + ".js")];

            const actualCss = require("./output/bundle." + ext + ".js");
            const expectedCss = readCss(ext, testId);

            // writing the actual css to output-dir for better debugging
            // fs.writeFileSync(path.join(__dirname, "output", `${ testId }.${ ext }.css`), actualCss, "utf8");
            actualCss.should.eql(expectedCss);
        });
    }

    describe(`sass-loader (${ ext })`, () => {
        describe("basic", () => {
            it("should compile simple sass without errors", () => execTest("language"));
        });
        describe("imports", () => {
            it("should resolve imports correctly", () => execTest("imports"));
            // Test for issue: https://github.com/jtangelder/sass-loader/issues/32
            it("should pass with multiple imports", () => execTest("multiple-imports"));
            // Test for issue: https://github.com/jtangelder/sass-loader/issues/73
            it("should resolve imports from other language style correctly", () => execTest("import-other-style"));
            // Test for includePath imports
            it("should resolve imports from another directory declared by includePaths correctly", () => execTest("import-include-paths", {
                includePaths: [path.join(__dirname, ext, "from-include-path")]
            }));
            it("should not resolve CSS imports", () => execTest("import-css"));
            it("should compile bootstrap-sass without errors", () => execTest("bootstrap-sass"));
        });
        describe("custom importers", () => {
            it("should use custom importer", () => execTest("custom-importer", {
                importer: customImporter
            }));
        });
        describe("custom functions", () => {
            it("should expose custom functions", () => execTest("custom-functions", {
                functions: customFunctions
            }));
        });
        describe("prepending data", () => {
            it("should extend the data-option if present", () => execTest("prepending-data", {
                data: "$prepended-data: hotpink;"
            }));
        });
    });
});

describe("sass-loader", () => {
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

function runWebpack(baseConfig, done) {
    const webpackConfig = merge({
        output: {
            path: path.join(__dirname, "output"),
            filename: "bundle.js",
            libraryTarget: "commonjs2"
        }
    }, baseConfig);

    webpack(webpackConfig, (webpackErr, stats) => {
        const err = webpackErr ||
            (stats.hasErrors && stats.compilation.errors[0]) ||
            (stats.hasWarnings && stats.compilation.warnings[0]);

        done(err || null);
    });
}
