var utils = require('loader-utils');
var sass = require('node-sass');
var path = require('path');


module.exports = function(content) {
  var root;

  this.cacheable && this.cacheable();
  
  var callback = this.async();

  var opt = utils.parseQuery(this.query);
  opt.data = content; 
  
  // set include path to fix imports
  opt.includePaths = opt.includePaths || [];
  opt.includePaths.push(path.dirname(this.resourcePath));
  if (this.options.resolve && this.options.resolve.root) {
      root = [].concat(this.options.resolve.root);
      opt.includePaths = opt.includePaths.concat(root);
  }
  
  // output compressed by default
  opt.outputStyle = opt.outputStyle || 'compressed';

  opt.success = function(css) {
    callback(null, "module.exports = " + JSON.stringify(css));
  };  
  opt.error = function(err) {
    throw err;
  };

  sass.render(opt);
};