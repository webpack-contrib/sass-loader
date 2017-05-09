"use strict";

require("should");

const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const merge = require("webpack-merge");
const customImporter = require("./tools/customImporter.js");
const customFunctions = require("./tools/customFunctions.js");
const pathToSassLoader = require.resolve("../lib/loader.js");
const testLoader = require("./tools/testLoader");
const sassLoader = require(pathToSassLoader);

const CR = /\r/g;
const syntaxStyles = ["scss", "sass"];
const pathToErrorFileNotFound = path.resolve(__dirname, "./scss/error-file-not-found.scss");
const pathToErrorFileNotFound2 = path.resolve(__dirname, "./scss/error-file-not-found-2.scss");
const pathToErrorFile = path.resolve(__dirname, "./scss/error.scss");
const pathToErrorImport = path.resolve(__dirname, "./scss/error-import.scss");
const loaderContextMock = {
    async: Function.prototype,
    cacheable: Function.prototype,
    dependency: Function.prototype
};

Object.defineProperty(loaderContextMock, "options", {
    set() {},
    get() {
        throw new Error("webpack options are not allowed to be accessed anymore.");
    }
});

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
            const actualCss = readBundle("bundle." + ext + ".js");
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
            // Test for issue: https://github.com/webpack-contrib/sass-loader/issues/32
            it("should pass with multiple imports", () => execTest("multiple-imports"));
            // Test for issue: https://github.com/webpack-contrib/sass-loader/issues/73
            it("should resolve imports from other language style correctly", () => execTest("import-other-style"));
            // Test for includePath imports
            it("should resolve imports from another directory declared by includePaths correctly", () => execTest("import-include-paths", {
                includePaths: [path.join(__dirname, ext, "includePath")]
            }));
            it("should not resolve CSS imports", () => execTest("import-css"));
            it("should compile bootstrap-sass without errors", () => execTest("bootstrap-sass"));
            it("should correctly import scoped npm packages", () => execTest("import-from-npm-org-pkg"));
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
        // See https://github.com/webpack-contrib/sass-loader/issues/21
        describe("empty files", () => {
            it("should compile without errors", () => execTest("empty"));
        });
    });
});

describe("sass-loader", () => {
    describe("multiple compilations", () => {
        it("should not interfere with each other", () =>
            new Promise((resolve, reject) => {
                runWebpack({
                    entry: {
                        b: path.join(__dirname, "scss", "multipleCompilations", "b.scss"),
                        c: path.join(__dirname, "scss", "multipleCompilations", "c.scss"),
                        a: path.join(__dirname, "scss", "multipleCompilations", "a.scss"),
                        d: path.join(__dirname, "scss", "multipleCompilations", "d.scss"),
                        e: path.join(__dirname, "scss", "multipleCompilations", "e.scss"),
                        f: path.join(__dirname, "scss", "multipleCompilations", "f.scss"),
                        g: path.join(__dirname, "scss", "multipleCompilations", "g.scss"),
                        h: path.join(__dirname, "scss", "multipleCompilations", "h.scss")
                    },
                    output: {
                        filename: "bundle.multiple-compilations.[name].js"
                    },
                    module: {
                        rules: [{
                            test: /\.scss$/,
                            use: [
                                { loader: "raw-loader" },
                                // We're specifying an empty options object because otherwise, webpack creates a new object for every loader invocation
                                // Since we want to ensure that our loader is not tampering with the option object, we are triggering webpack to re-use the options object
                                // @see https://github.com/webpack-contrib/sass-loader/issues/368#issuecomment-278330164
                                { loader: pathToSassLoader, options: {} }
                            ]
                        }]
                    }
                }, err => err ? reject(err) : resolve());
            })
                .then(() => {
                    const expectedCss = readCss("scss", "imports");
                    const a = readBundle("bundle.multiple-compilations.a.js");
                    const b = readBundle("bundle.multiple-compilations.b.js");
                    const c = readBundle("bundle.multiple-compilations.c.js");
                    const d = readBundle("bundle.multiple-compilations.d.js");
                    const e = readBundle("bundle.multiple-compilations.e.js");
                    const f = readBundle("bundle.multiple-compilations.f.js");
                    const g = readBundle("bundle.multiple-compilations.g.js");
                    const h = readBundle("bundle.multiple-compilations.h.js");

                    a.should.equal(expectedCss);
                    b.should.equal(expectedCss);
                    c.should.equal(expectedCss);
                    d.should.equal(expectedCss);
                    e.should.equal(expectedCss);
                    f.should.equal(expectedCss);
                    g.should.equal(expectedCss);
                    h.should.equal(expectedCss);
                })
        );
    });
    describe("source maps", () => {
        function buildWithSourceMaps() {
            return new Promise((resolve, reject) => {
                runWebpack({
                    entry: path.join(__dirname, "scss", "imports.scss"),
                    output: {
                        filename: "bundle.source-maps.js"
                    },
                    devtool: "source-map",
                    module: {
                        rules: [{
                            test: /\.scss$/,
                            use: [
                                { loader: testLoader.filename },
                                { loader: pathToSassLoader, options: {
                                    sourceMap: true
                                } }
                            ]
                        }]
                    }
                }, err => err ? reject(err) : resolve());
            });
        }

        it("should compile without errors", () => buildWithSourceMaps());
        it("should produce a valid source map", () => {
            const cwdGetter = process.cwd;
            const fakeCwd = path.join(__dirname, "scss");

            process.cwd = function () {
                return fakeCwd;
            };

            return buildWithSourceMaps()
                .then(() => {
                    const sourceMap = testLoader.sourceMap;

                    sourceMap.should.not.have.property("file");
                    sourceMap.should.have.property("sourceRoot", fakeCwd);
                    // This number needs to be updated if imports.scss or any dependency of that changes
                    sourceMap.sources.should.have.length(8);
                    sourceMap.sources.forEach(sourcePath =>
                        fs.existsSync(path.resolve(sourceMap.sourceRoot, sourcePath))
                    );

                    process.cwd = cwdGetter;
                });
        });
    });
    describe("errors", () => {
        it("should throw an error in synchronous loader environments", () => {
            try {
                sassLoader.call(Object.create(loaderContextMock), "");
            } catch (err) {
                // check for file excerpt
                err.message.should.equal("Synchronous compilation is not supported anymore. See https://github.com/webpack-contrib/sass-loader/issues/333");
            }
        });
        it("should output understandable errors in entry files", (done) => {
            runWebpack({
                entry: pathToSassLoader + "!" + pathToErrorFile
            }, (err) => {
                err.message.should.match(/Property "some-value" must be followed by a ':'/);
                err.message.should.match(/\(line 2, column 5\)/);
                err.message.indexOf(pathToErrorFile).should.not.equal(-1);
                done();
            });
        });
        it("should output understandable errors of imported files", (done) => {
            runWebpack({
                entry: pathToSassLoader + "!" + pathToErrorImport
            }, (err) => {
                // check for file excerpt
                err.message.should.match(/Property "some-value" must be followed by a ':'/);
                err.message.should.match(/\(line 2, column 5\)/);
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
            (stats.hasErrors() && stats.compilation.errors[0]) ||
            (stats.hasWarnings() && stats.compilation.warnings[0]);

        done(err || null);
    });
}

function readBundle(filename) {
    delete require.cache[path.resolve(__dirname, `./output/${ filename }`)];

    return require(`./output/${ filename }`);
}
