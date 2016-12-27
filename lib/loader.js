"use strict";

const utils = require("loader-utils");
const sass = require("node-sass");
const path = require("path");
const os = require("os");
const async = require("async");
const assign = require("object-assign");
const formatSassError = require("./formatSassError");
const proxyCustomImporters = require("./proxyCustomImporters");
const webpackImporter = require("./webpackImporter");
const pify = require("pify");

// This queue makes sure node-sass leaves one thread available for executing
// fs tasks when running the custom importer code.
// This can be removed as soon as node-sass implements a fix for this.
const threadPoolSize = process.env.UV_THREADPOOL_SIZE || 4;
const asyncSassJobQueue = async.queue(sass.render, threadPoolSize - 1);

/**
 * The sass-loader makes node-sass available to webpack modules.
 *
 * @this {LoaderContext}
 * @param {string} content
 */
function sassLoader(content) {
    const formatSassErrorHere = formatSassError(this.resourcePath);
    const callback = this.async();
    const isSync = typeof callback !== "function";
    const self = this;
    const resourcePath = this.resourcePath;

    // When files have been imported via the includePaths-option, these files need to be
    // introduced to webpack in order to make them watchable.
    function addIncludedFilesToWebpack(includedFiles) {
        includedFiles.forEach(addNormalizedDependency);
    }

    function addNormalizedDependency(file) {
        // node-sass returns UNIX-style paths
        self.dependency(path.normalize(file));
    }

    if (isSync) {
        throw new Error("Synchronous compilation is not supported anymore. See https://github.com/jtangelder/sass-loader/issues/333");
    }

    this.cacheable();

    const sassOptions = getLoaderConfig(this);

    sassOptions.data = sassOptions.data ? (sassOptions.data + os.EOL + content) : content;

    // Skip empty files, otherwise it will stop webpack, see issue #21
    if (sassOptions.data.trim() === "") {
        callback(null, content);
        return;
    }

    // opt.outputStyle
    if (!sassOptions.outputStyle && this.minimize) {
        sassOptions.outputStyle = "compressed";
    }

    // opt.sourceMap
    // Not using the `this.sourceMap` flag because css source maps are different
    // @see https://github.com/webpack/css-loader/pull/40
    if (sassOptions.sourceMap) {
        // deliberately overriding the sourceMap option
        // this value is (currently) ignored by libsass when using the data input instead of file input
        // however, it is still necessary for correct relative paths in result.map.sources.
        sassOptions.sourceMap = this.options.context + "/sass.map";
        sassOptions.omitSourceMapUrl = true;

        // If sourceMapContents option is not set, set it to true otherwise maps will be empty/null
        // when exported by webpack-extract-text-plugin.
        if ("sourceMapContents" in sassOptions === false) {
            sassOptions.sourceMapContents = true;
        }
    }

    // indentedSyntax is a boolean flag.
    const ext = path.extname(resourcePath);

    // If we are compiling sass and indentedSyntax isn't set, automatically set it.
    if (ext && ext.toLowerCase() === ".sass" && "indentedSyntax" in sassOptions === false) {
        sassOptions.indentedSyntax = true;
    } else {
        sassOptions.indentedSyntax = Boolean(sassOptions.indentedSyntax);
    }

    // Allow passing custom importers to `node-sass`. Accepts `Function` or an array of `Function`s.
    sassOptions.importer = sassOptions.importer ? proxyCustomImporters(sassOptions.importer, resourcePath) : [];
    sassOptions.importer.push(webpackImporter(
        this.resourcePath,
        pify(this.resolve.bind(this)),
        addNormalizedDependency
    ));

    // `node-sass` uses `includePaths` to resolve `@import` paths. Append the currently processed file.
    sassOptions.includePaths = sassOptions.includePaths ? [].concat(sassOptions.includePaths) : [];
    sassOptions.includePaths.push(path.dirname(resourcePath));

    // start the actual rendering
    asyncSassJobQueue.push(sassOptions, (err, result) => {
        if (err) {
            formatSassErrorHere(err);
            err.file && self.dependency(err.file);
            callback(err);
            return;
        }

        if (result.map && result.map !== "{}") {
            result.map = JSON.parse(result.map);
            result.map.file = resourcePath;
            // The first source is 'stdin' according to libsass because we've used the data input
            // Now let's override that value with the correct relative path
            result.map.sources[0] = path.relative(self.options.context, resourcePath);
            result.map.sourceRoot = path.relative(self.options.context, process.cwd());
        } else {
            result.map = null;
        }

        addIncludedFilesToWebpack(result.stats.includedFiles);
        callback(null, result.css.toString(), result.map);
    });
}

/**
 * Check the loader query and webpack config for loader options. If an option is defined in both places,
 * the loader query takes precedence.
 *
 * @param {LoaderContext} loaderContext
 * @returns {Object}
 */
function getLoaderConfig(loaderContext) {
    const query = utils.parseQuery(loaderContext.query);
    const configKey = query.config || "sassLoader";
    const config = loaderContext.options[configKey] || {};

    delete query.config;

    return assign({}, config, query);
}

module.exports = sassLoader;
