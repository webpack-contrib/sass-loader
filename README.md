# sass loader for [webpack](http://webpack.github.io/)


## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

``` javascript
var css = require("!raw!sass!./file.scss");
// => returns compiled css code from file.scss, resolves imports
var css = require("!css!sass!./file.scss");
// => returns compiled css code from file.scss, resolves imports and url(...)s
```

Use in tandem with the [`style-loader`](https://github.com/webpack/style-loader) to add the css rules to your document:

``` javascript
require("!style!css!sass!./file.scss");
```

### webpack config

It's recommended to adjust your `webpack.config` so `style!css!sass!` is applied automatically on all files ending on `.scss`:

``` javascript
module.exports = {
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: "style!css!sass?outputStyle=expanded"
      }
    ]
  }
};
```

Then you only need to write: `require("./file.scss")`. See [`node-sass`](https://github.com/andrew/node-sass) for the available options.

## Install

`npm install sass-loader`

## Caveats

The sass-loader does not currently follow all of the webpack loader guidelines.  Specifically, until the [mark and resolve dependencies](https://github.com/jtangelder/sass-loader/issues/2) feature is added, webpack will not resolve your `@import` statements for you or watch and reload when a SASS dependency changes.  You can use a third party watch module to handle at least the reloading aspect for the time being.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
