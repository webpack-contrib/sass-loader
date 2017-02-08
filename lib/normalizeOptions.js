"use strict";

const os = require("os");
const utils = require("loader-utils");
const path = require("path");
const proxyCustomImporters = require("./proxyCustomImporters");

/**
 * Derives the sass options from the loader context and normalizes its values with sane defaults.
 *
 * Please note: If loaderContext.query is an options object, it will be re-used across multiple invocations.
 * That's why we must not modify the object directly.
 *
 * @param {LoaderContext} loaderContext
 * @param {string} content
 * @param {Function} webpackImporter
 * @returns {Object}
 */
function normalizeOptions(loaderContext, content, webpackImporter) {
    const options = loaderContext.query && typeof loaderContext.query === "object" ?
        // Make a copy of the query object
        // @see https://github.com/jtangelder/sass-loader/issues/368#issuecomment-278330164
        Object.assign({}, loaderContext.query) :
        utils.parseQuery(loaderContext.query);

    const resourcePath = loaderContext.resourcePath;

    options.data = options.data ? (options.data + os.EOL + content) : content;

    // opt.outputStyle
    if (!options.outputStyle && loaderContext.minimize) {
        options.outputStyle = "compressed";
    }

    // opt.sourceMap
    // Not using the `this.sourceMap` flag because css source maps are different
    // @see https://github.com/webpack/css-loader/pull/40
    if (options.sourceMap) {
        // deliberately overriding the sourceMap option
        // this value is (currently) ignored by libsass when using the data input instead of file input
        // however, it is still necessary for correct relative paths in result.map.sources.
        options.sourceMap = loaderContext.options.context + "/sass.map";
        options.omitSourceMapUrl = true;

        // If sourceMapContents option is not set, set it to true otherwise maps will be empty/null
        // when exported by webpack-extract-text-plugin.
        if ("sourceMapContents" in options === false) {
            options.sourceMapContents = true;
        }
    }

    // indentedSyntax is a boolean flag.
    const ext = path.extname(resourcePath);

    // If we are compiling sass and indentedSyntax isn't set, automatically set it.
    if (ext && ext.toLowerCase() === ".sass" && "indentedSyntax" in options === false) {
        options.indentedSyntax = true;
    } else {
        options.indentedSyntax = Boolean(options.indentedSyntax);
    }

    // Allow passing custom importers to `node-sass`. Accepts `Function` or an array of `Function`s.
    options.importer = options.importer ? proxyCustomImporters(options.importer, resourcePath) : [];
    options.importer.push(webpackImporter);

    // `node-sass` uses `includePaths` to resolve `@import` paths. Append the currently processed file.
    options.includePaths = options.includePaths ? [].concat(options.includePaths) : [];
    options.includePaths.push(path.dirname(resourcePath));

    return options;
}

module.exports = normalizeOptions;
