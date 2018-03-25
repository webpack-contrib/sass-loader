"use strict";

const path = require("path");
const formatSassError = require("./formatSassError");
const webpackImporter = require("./webpackImporter");
const normalizeOptions = require("./normalizeOptions");
const pify = require("pify");
const compilers = require("./compilers");

const asyncJobQueue = compilers.getCompilerQueue();

/**
 * The sass-loader makes node-sass available to webpack modules.
 *
 * @this {LoaderContext}
 * @param {string} content
 */
function sassLoader(content) {
    const callback = this.async();
    const isSync = typeof callback !== "function";
    const self = this;
    const resourcePath = this.resourcePath;

    function addNormalizedDependency(file) {
        // node-sass returns POSIX paths
        self.dependency(path.normalize(file));
    }

    if (isSync) {
        throw new Error("Synchronous compilation is not supported anymore. See https://github.com/webpack-contrib/sass-loader/issues/333");
    }

    const compilerError = asyncJobQueue.error;

    if (compilerError) {
        callback(asyncJobQueue.reason);
        return;
    }

    const options = normalizeOptions(this, content, webpackImporter(
        resourcePath,
        pify(this.resolve.bind(this)),
        addNormalizedDependency
    ));

    // Skip empty files, otherwise it will stop webpack, see issue #21
    if (options.data.trim() === "") {
        callback(null, "");
        return;
    }

    // start the actual rendering
    const asyncSassJobQueue = asyncJobQueue.value;

    asyncSassJobQueue.push(options, (err, result) => {
        if (err) {
            formatSassError(err, this.resourcePath);
            err.file && this.dependency(err.file);
            callback(err);
            return;
        }

        if (result.map && result.map !== "{}") {
            result.map = JSON.parse(result.map);
            // result.map.file is an optional property that provides the output filename.
            // Since we don't know the final filename in the webpack build chain yet, it makes no sense to have it.
            delete result.map.file;
            // The first source is 'stdin' according to node-sass because we've used the data input.
            // Now let's override that value with the correct relative path.
            // Since we specified options.sourceMap = path.join(process.cwd(), "/sass.map"); in normalizeOptions,
            // we know that this path is relative to process.cwd(). This is how node-sass works.
            result.map.sources[0] = path.relative(process.cwd(), resourcePath);
            // node-sass returns POSIX paths, that's why we need to transform them back to native paths.
            // This fixes an error on windows where the source-map module cannot resolve the source maps.
            // @see https://github.com/webpack-contrib/sass-loader/issues/366#issuecomment-279460722
            result.map.sourceRoot = path.normalize(result.map.sourceRoot);
            result.map.sources = result.map.sources.map(path.normalize);
        } else {
            result.map = null;
        }

        result.stats.includedFiles.forEach(addNormalizedDependency);
        callback(null, result.css.toString(), result.map);
    });
}

module.exports = sassLoader;
