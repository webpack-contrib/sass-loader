'use strict';

var utils = require('loader-utils');
var sass = require('node-sass');
var path = require('path');
var os = require('os');
var fs = require('fs');

// A typical sass error looks like this
var SassError = {
    message: 'invalid property name',
    column: 14,
    line: 1,
    file: 'stdin',
    status: 1
};

var extPrecedence = ['.scss', '.sass', '.css'];
var matchCss = /\.css$/;

/**
 * The sass-loader makes node-sass available to webpack modules.
 *
 * @param {string} content
 * @returns {*}
 */
module.exports = function (content) {
    var callback = this.async();
    var isSync = typeof callback !== 'function';
    var self = this;
    var resourcePath = this.resourcePath;
    var result;
    var opt;

    /**
     * Enhances the sass error with additional information about what actually went wrong.
     *
     * @param {SassError} err
     */
    function formatSassError(err) {
        var msg = err.message;

        if (err.file === 'stdin') {
            err.file = resourcePath;
        }
        // node-sass returns UNIX-style paths
        err.file = path.normalize(err.file);

        // The 'Current dir' hint of node-sass does not help us, we're providing
        // additional information by reading the err.file property
        msg = msg.replace(/\s*Current dir:\s*/, '');

        err.message = getFileExcerptIfPossible(err) +
            msg.charAt(0).toUpperCase() + msg.slice(1) + os.EOL +
            '      in ' + err.file + ' (line ' + err.line + ', column ' + err.column + ')';

        // Instruct webpack to hide the JS stack from the console
        // Usually you're only interested in the SASS stack in this case.
        err.hideStack = true;
    }

    /**
     * Returns an importer that uses webpack's resolving algorithm.
     *
     * It's important that the returned function has the correct number of arguments
     * (based on whether the call is sync or async) because otherwise node-sass doesn't exit.
     *
     * @returns {function}
     */
    function getWebpackImporter() {
        if (isSync) {
            return function syncWebpackImporter(url, context) {
                url = utils.urlToRequest(url, opt.root);
                context = normalizeContext(context);

                return syncResolve(context, url, getImportsToResolve(url));
            };
        }
        return function asyncWebpackImporter(url, context, done) {
            url = utils.urlToRequest(url, opt.root);
            context = normalizeContext(context);

            asyncResolve(context, url, getImportsToResolve(url), done);
        };
    }

    /**
     * Tries to resolve the given url synchronously. If a resolve error occurs, a second try for the same
     * module prefixed with an underscore is started.
     *
     * @param {object} loaderContext
     * @param {string} url
     //* @param {string} context
     * @returns {object}
     */
    function syncResolve(fileContext, originalImport, importsToResolve) {
        var importToResolve = importsToResolve.shift();
        var resolvedFilename;

        if (!importToResolve) {
            return {
                file: originalImport
            };
        }

        try {
            resolvedFilename = self.resolveSync(fileContext, importToResolve);
            resolvedFilename = resolvedFilename.replace(matchCss, '');
            return {
                file: resolvedFilename
            };
        } catch (err) {
            return syncResolve(fileContext, originalImport, importsToResolve);
        }
    }

    /**
     * Tries to resolve the given url asynchronously. If a resolve error occurs, a second try for the same
     * module prefixed with an underscore is started.
     *
     * @param {object} loaderContext
     * @param {string} url
     * @param {string} fileContext
     * @param {function} done
     */
    function asyncResolve(fileContext, originalImport, importsToResolve, done) {
        var importToResolve = importsToResolve.shift();

        if (!importToResolve) {
            done({
                file: originalImport
            });
            return;
        }

        self.resolve(fileContext, importToResolve, function onWebpackResolve(err, resolvedFilename) {
            if (err) {
                asyncResolve(fileContext, originalImport, importsToResolve, done);
                return;
            }
            // Use self.loadModule() before calling done() to make imported files available to
            // other webpack tools like postLoaders etc.?

            resolvedFilename = resolvedFilename.replace(matchCss, '');
            done({
                file: resolvedFilename.replace(matchCss, '')
            });
        });
    }

    function normalizeContext(context) {
        // The first file is 'stdin' when we're using the data option
        if (context === 'stdin') {
            context = resourcePath;
        }
        return path.dirname(context);
    }

    // When files have been imported via the includePaths-option, these files need to be
    // introduced to webpack in order to make them watchable.
    function addIncludedFilesToWebpack(includedFiles) {
        includedFiles.forEach(addNormalizedDependency);
    }

    function addNormalizedDependency(file) {
        // node-sass returns UNIX-style paths
        self.dependency(path.normalize(file));
    }

    this.cacheable();

    opt = utils.parseQuery(this.query);
    opt.data = content;

    // Skip empty files, otherwise it will stop webpack, see issue #21
    if (opt.data.trim() === '') {
        return isSync ? content : callback(null, content);
    }

    // opt.outputStyle
    if (!opt.outputStyle && this.minimize) {
        opt.outputStyle = 'compressed';
    }

    // opt.sourceMap
    // Not using the `this.sourceMap` flag because css source maps are different
    // @see https://github.com/webpack/css-loader/pull/40
    if (opt.sourceMap) {
        // deliberately overriding the sourceMap option
        // this value is (currently) ignored by libsass when using the data input instead of file input
        // however, it is still necessary for correct relative paths in result.map.sources
        opt.sourceMap = this.options.output.path + '/sass.map';
        opt.omitSourceMapUrl = true;

        // If sourceMapContents option is not set, set it to true otherwise maps will be empty/null
        // when exported by webpack-extract-text-plugin.
        if ('sourceMapContents' in opt === false) {
            opt.sourceMapContents = true;
        }
    }

    // indentedSyntax is a boolean flag
    opt.indentedSyntax = Boolean(opt.indentedSyntax);

    opt.importer = getWebpackImporter();

    // start the actual rendering
    if (isSync) {
        try {
            result = sass.renderSync(opt);
            addIncludedFilesToWebpack(result.stats.includedFiles);
            return result.css.toString();
        } catch (err) {
            formatSassError(err);
            throw err;
        }
    }
    sass.render(opt, function onRender(err, result) {
        if (err) {
            formatSassError(err);
            callback(err);
            return;
        }

        if (result.map && result.map !== '{}') {
            result.map = JSON.parse(result.map);
            result.map.file = resourcePath;
            // The first source is 'stdin' according to libsass because we've used the data input
            // Now let's override that value with the correct relative path
            result.map.sources[0] = path.relative(self.options.output.path, resourcePath);
        } else {
            result.map = null;
        }

        addIncludedFilesToWebpack(result.stats.includedFiles);
        callback(null, result.css.toString(), result.map);
    });
};

/**
 * Tries to get an excerpt of the file where the error happened.
 * Uses err.line and err.column.
 *
 * Returns an empty string if the excerpt could not be retrieved.
 *
 * @param {SassError} err
 * @returns {string}
 */
function getFileExcerptIfPossible(err) {
    var content;

    try {
        content = fs.readFileSync(err.file, 'utf8');

        return os.EOL +
            content.split(os.EOL)[err.line - 1] + os.EOL +
            new Array(err.column - 1).join(' ') + '^' + os.EOL +
            '      ';
    } catch (err) {
        // If anything goes wrong here, we don't want any errors to be reported to the user
        return '';
    }
}

function getImportsToResolve(originalImport) {
    var ext = path.extname(originalImport);
    var basename = path.basename(originalImport);
    var dirname = path.dirname(originalImport);
    var startsWithUnderscore = basename.charAt(0) === '_';
    var paths = [];

    function add(file) {
        paths.push(dirname + path.sep + file);
    }

    if (originalImport.charAt(0) !== '.') {
        if (dirname === '.') {
            return [originalImport];
        }
    }
    if (ext) {
        if (ext === '.scss' || ext === '.sass') {
            add(basename);
            if (!startsWithUnderscore) {
                add('_' + basename);
            }
        }/* else {
            Leave unknown extensions (like .css) untouched
        }*/
    } else {
        extPrecedence.forEach(function (ext) {
            add('_' + basename + ext);
        });
        extPrecedence.forEach(function (ext) {
            add(basename + ext);
        });
    }

    return paths;
}
