'use strict';

var utils = require('loader-utils');
var sass = require('node-sass');
var path = require('path');
var sassGraph = require('sass-graph');

module.exports = function (content) {
    this.cacheable();
    var callback = this.async();

    var opt = utils.parseQuery(this.query);
    opt.data = content;

    // skip empty files, otherwise it will stop webpack, see issue #21
    if (opt.data.trim() === '') {
        return callback(null, content);
    }

    // set include path to fix imports
    opt.includePaths = opt.includePaths || [];
    opt.includePaths.push(path.dirname(this.resourcePath));
    if (this.options.resolve && this.options.resolve.root) {
        var root = [].concat(this.options.resolve.root);
        opt.includePaths = opt.includePaths.concat(root);
    }

    if (!opt.outputStyle && this.minimize) {
        opt.outputStyle = 'compressed';
    }

    // not using the `this.sourceMap` flag because css source maps are different
    // @see https://github.com/webpack/css-loader/pull/40
    if (opt.sourceMap) {
        // deliberately overriding the sourceMap option
        // this value is (currently) ignored by libsass when using the data input instead of file input
        // however, it is still necessary for correct relative paths in result.map.sources
        opt.sourceMap = this.options.output.path + '/sass.map';
    }

    var loadPaths = opt.includePaths;
    var markDependencies = function () {
        try {
            var graph = sassGraph.parseFile(this.resourcePath, {loadPaths: loadPaths});
            graph.visitDescendents(this.resourcePath, function (imp) {
                this.addDependency(imp);
            }.bind(this));
        } catch (err) {
            this.emitError(err);
        }
    }.bind(this);

    sass.render(opt, function(err, result) {
        if(err) {
            markDependencies();
            callback({message: err.message + ' (' + err.line + ':' + err.column + ')'});
            return;
        }

        markDependencies();

        if (result.map && result.map !== '{}') {
            result.map = JSON.parse(result.map);
            result.map.file = utils.getCurrentRequest(this);
            // the first source is 'stdin' according to libsass because we've used the data input
            // now let's override that value with the correct relative path
            result.map.sources[0] = path.relative(this.options.output.path, utils.getRemainingRequest(this));
        } else {
            result.map = null;
        }

        callback(null, result.css, result.map);
    }.bind(this));
};
