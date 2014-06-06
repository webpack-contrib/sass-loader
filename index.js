var util = require('util');
var utils = require('loader-utils');
var sass = require('node-sass');
var path = require('path');


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

    opt.success = function (css) {
        // mark dependencies
        opt.stats.includedFiles.forEach(function(path) {
            this.addDependency(path);
        }, this);
        callback(null, css);
    }.bind(this);

    opt.error = function (err) {
        callback(err);
    };

    sass.render(opt);
};
