'use strict';

var utils = require('loader-utils');
var sass = require('node-sass');
var path = require('path');

module.exports = function (content) {
    var callback = this.async();
    var isSync = typeof callback !== 'function';
    var self = this;
    var resourcePath = this.resourcePath;
    var fileExt;
    var opt;

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
                callback(err);
            }
            return filename;
        }
        self.resolve(context, request, function onWebpackResolve(err, filename) {
            if (err) {
                callback(err);
                return;
            }

            self.dependency && self.dependency(filename);
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
        return sass.renderSync(opt).css;
    }
    sass.render(opt, function onRender(err, result) {
        if (err) {
            callback({message: err.message + ' (' + err.line + ':' + err.column + ')'});
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
