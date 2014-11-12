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
        // Query parameters are passed to node-sass
        loader: "style!css!sass?outputStyle=expanded&" +
          "includePaths[]=" +
            (path.resolve(__dirname, "./bower_components")) + "&" +
          "includePaths[]=" +
            (path.resolve(__dirname, "./node_modules"))
      }
    ]
  }
};
```

Then you only need to write: `require("./file.scss")`. See [`node-sass`](https://github.com/andrew/node-sass) for the available options.

## Install

`npm install sass-loader`

## Caveats

Currently the sass-loader does not follow all of the webpack loader guidelines. The general problem is that the entry scss-file is passed to [node-sass](https://github.com/sass/node-sass) which does pretty much the rest. Thus `@import` statements inside your scss-files cannot be resolved by webpack's resolver. However, there is an [issue for that missing feature in libsass](https://github.com/sass/libsass/issues/21).

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
