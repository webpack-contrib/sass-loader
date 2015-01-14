var utils = require('loader-utils');
var sass = require('node-sass');
var path = require('path');

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

    opt.success = function (result) {
        result.stats.includedFiles.forEach(this.addDependency);
        callback(null, result.css, result.map);
    }.bind(this);

    opt.error = function (err) {
        callback({message: err.message + ' (' + err.line + ':' + err.column + ')'});
    };

    sass.render(opt);
};
