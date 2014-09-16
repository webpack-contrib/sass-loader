var util = require('util');
var utils = require('loader-utils');
var sass = require('node-sass');
var path = require('path');
var sassGraph = require('sass-graph');


module.exports = function (content) {
    this.cacheable();
    var callback = this.async();

    var opt = utils.parseQuery(this.query);
    opt.data = content;

    // set include path to fix imports
    opt.includePaths = opt.includePaths || [];
    opt.includePaths.push(path.dirname(this.resourcePath));
    if (this.options.resolve && this.options.resolve.root) {
        var root = [].concat(this.options.resolve.root);
        opt.includePaths = opt.includePaths.concat(root);
    }

    // output compressed by default
    opt.outputStyle = opt.outputStyle || 'compressed';
    opt.stats = {};

    // mark dependencies
    var graph = sassGraph.parseFile(this.resourcePath, {loadPaths: opt.includePaths});
    graph.visitDescendents(this.resourcePath, function (imp) {
        this.addDependency(imp);
    }.bind(this));

    opt.success = function (css) {
        callback(null, css);
    }.bind(this);

    opt.error = function (err) {
        this.emitError(err);
        callback(err);
    }.bind(this);

    sass.render(opt);
};
