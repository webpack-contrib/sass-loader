"use strict";

const os = require("os");
const utils = require("loader-utils");
const cloneDeep = require("clone-deep");
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
    const options = cloneDeep(utils.getOptions(loaderContext)) || {};
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
        /**
         * > Path to a file for LibSass to compile.
         * @see node-sass [file]{@link https://github.com/sass/node-sass#file}
         *
         * > **Special behaviours**
         * >
         * > In the case that both file and data options are set, node-sass will
         * > give precedence to data and use file to calculate paths in
         * > sourcemaps.
         * @see node-sass [Special behaviours]{@link https://github.com/sass/node-sass#special-behaviours}
         *
         * Another benefit to setting this is that `stdin`/`stdout` will no
         * longer appear in `map.sources`. There will be no need to update
         * `map.sources`, `map.names`, or similar.
         *
         * @type {String} [options.file=null]
         */
        options.file = resourcePath;

        /**
         * > **Special:** Required when `sourceMap` is a truthy value
         * >
         * > Specify the intended location of the output file. Strongly
         * > recommended when outputting source maps so that they can properly
         * > refer back to their intended files.
         * >
         * > **Attention** enabling this option will not write the file on disk
         * > for you, it's for internal reference purpose only (to generate the
         * > map for example).
         * @see node-sass [outFile]{@link https://github.com/sass/node-sass#outfile}
         *
         * Even though we are always setting `sourceMap` to a string, the
         * documentation says this is required, so set it to the expected value
         * to comply with the requirement.
         *
         * `sass-loader` isn't responsible for writing the map, so it doesn't
         * have to worry about updating the map with a transformation that
         * changes locations (suchs as map.file or map.sources).
         *
         * Changing the file extension counts as changing the location because
         * it changes the path.
         *
         * @type {String | null} [options.outFile=null]
         */
        options.outFile = resourcePath;

        /**
         * > **Special: ** Setting the `sourceMap` option requires also setting
         * > the `outFile` option
         * >
         * > Enables the outputting of a source map during `render` and
         * > `renderSync`. When `sourceMap === true`, the value of `outFile` is
         * > used as the target output location for the source map. When
         * > `typeof sourceMap === "string"`, the value of `sourceMap` will be
         * > used as the writing location for the file.
         * @see node-sass [sourceMap]{@link https://github.com/sass/node-sass#sourcemap}
         *
         * @type {Boolean | String | undefined} [options.sourceMap=undefined]
         */
        options.sourceMap = options.outFile + ".map";
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
    options.includePaths = options.includePaths || [];
    options.includePaths.push(path.dirname(resourcePath));

    return options;
}

module.exports = normalizeOptions;
