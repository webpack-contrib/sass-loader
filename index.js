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

    // output compressed by default
    opt.outputStyle = opt.outputStyle || 'compressed';
    opt.stats = {};
    
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

    opt.success = function (css) {
        markDependencies();
        callback(null, css);
    }.bind(this);

    opt.error = function (err) {
        markDependencies();
        this.emitError(err);
        callback(err);
    }.bind(this);

    sass.render(opt);
};
