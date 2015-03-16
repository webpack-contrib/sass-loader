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

module.exports = function (content) {
    var callback = this.async();
    var isSync = typeof callback !== 'function';
    var self = this;
    var resourcePath = this.resourcePath;
    var fileExt;
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

        // The 'Current dir' hint of node-sass does not help us, we're providing
        // additional information by reading the err.file property
        msg = msg.replace(/\s*Current dir:\s*/, '');

        err.message = getFileExcerptIfPossible(err) +
            msg.charAt(0).toUpperCase() + msg.slice(1) + os.EOL +
            '      in ' + err.file + ' (line ' + err.line + ', column ' + err.column + ')';
    }

    this.cacheable();

    opt = utils.parseQuery(this.query);
    opt.data = content;

    // skip empty files, otherwise it will stop webpack, see issue #21
    if (opt.data.trim() === '') {
        return callback(null, content);
    }

    // opt.outputStyle
    if (!opt.outputStyle && this.minimize) {
        opt.outputStyle = 'compressed';
    }

    // opt.sourceMap
    // not using the `this.sourceMap` flag because css source maps are different
    // @see https://github.com/webpack/css-loader/pull/40
    if (opt.sourceMap) {
        // deliberately overriding the sourceMap option
        // this value is (currently) ignored by libsass when using the data input instead of file input
        // however, it is still necessary for correct relative paths in result.map.sources
        opt.sourceMap = this.options.output.path + '/sass.map';
    }

    fileExt = '.' + (opt.indentedSyntax || 'scss');

    // opt.importer
    opt.importer = function webpackImporter(url, context, importDone) {
        var request;
        var filename;

        // The first file is 'stdin' when we're using the data option
        if (context === 'stdin') {
            context = resourcePath;
        }

        // Add file extension if it's not present already
        if (url.slice(-fileExt.length) !== fileExt) {
            url = url + fileExt;
        }

        context = path.dirname(context);
        request = utils.urlToRequest(url, opt.root);

        if (isSync) {
            try {
                filename = self.resolveSync(context, request);
                self.dependency && self.dependency(filename);
            } catch (err) {
                // Unfortunately we can't return an error inside a custom importer yet
                // @see https://github.com/sass/node-sass/issues/651#issuecomment-73317319
                filename = url;
            }
            return {
                file: filename
            };
        }
        self.resolve(context, request, function onWebpackResolve(err, filename) {
            if (err) {
                // Unfortunately we can't return an error inside a custom importer yet
                // @see https://github.com/sass/node-sass/issues/651#issuecomment-73317319
                filename = url;
            } else {
                self.dependency && self.dependency(filename);
            }

            importDone({
                file: filename
            });

            // It would be better if we could use self.loadModule() to give other
            // loaders the chance to intercept but unfortunately node-sass is currently giving
            // us strange segfaults when we're returning contents

            //self.loadModule('-!' + __dirname + '/stringify.loader.js!' + filename, function (err, data) {
            //    if (err) {
            //        callback(err);
            //        return;
            //    }
            //
            //    importDone({
            //        file: filename,
            //        contents: JSON.parse(data)
            //    });
            //});
        });
    };

    if (isSync) {
        try {
            return sass.renderSync(opt);
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
            // the first source is 'stdin' according to libsass because we've used the data input
            // now let's override that value with the correct relative path
            result.map.sources[0] = path.relative(self.options.output.path, resourcePath);
        } else {
            result.map = null;
        }

        callback(null, result.css, result.map);
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
        // if anything goes wrong here, we don't want any errors to be reported to the user
        return '';
    }
}
