# sass loader for [webpack](http://webpack.github.io/)

## Install

`npm install sass-loader`

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

### Apply via webpack config

It's recommended to adjust your `webpack.config` so `style!css!sass!` is applied automatically on all files ending on `.scss`:

``` javascript
module.exports = {
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: "style!css!sass"
      }
    ]
  }
};
```

Then you only need to write: `require("./file.scss")`.

### SASS options

You can pass any SASS specific configuration options through to the render function via [query parameters](http://webpack.github.io/docs/using-loaders.html#query-parameters).

``` javascript
module.exports = {
  module: {
    loaders: [
      {
        test: /\.scss$/,
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

See [node-sass](https://github.com/andrew/node-sass) for all available options.

### .sass files

For requiring `.sass` files, add `indentedSyntax` as a loader option:

``` javascript
module.exports = {
  module: {
    loaders: [
      {
        test: /\.sass$/,
        // Passing indentedSyntax query param to node-sass
        loader: "style!css!sass?indentedSyntax"
      }
    ]
  }
};
```

## Source maps

Because of browser limitations, source maps are only available in conjunction with the [extract-text-webpack-plugin](https://github.com/webpack/extract-text-webpack-plugin). Use that plugin to extract the CSS code from the generated JS bundle into a separate file (which even improves the perceived performance because JS and CSS are loaded in parallel).

Then your `webpack.config.js` should look like this:

```javascript
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    ...
    // must be 'source-map' or 'inline-source-map'
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(
                    // activate source maps via loader query
                    'css?sourceMap!' +
                    'sass?sourceMap'
                )
            }
        ]
    },
    plugins: [
        // extract inline css into separate 'styles.css'
        new ExtractTextPlugin('styles.css')
    ]
};
```

If you want to view the original SASS files inside Chrome and even edit it,  [there's a good blog post](https://medium.com/@toolmantim/getting-started-with-css-sourcemaps-and-in-browser-sass-editing-b4daab987fb0). Checkout [test/sourceMap](https://github.com/jtangelder/sass-loader/tree/master/test) for a running example. Make sure to serve the content with an HTTP server.


## Caveats

Currently the sass-loader does not follow all of the webpack loader guidelines. The general problem is that the entry scss-file is passed to [node-sass](https://github.com/sass/node-sass) which does pretty much the rest. Thus `@import` statements inside your scss-files cannot be resolved by webpack's resolver. However, there is an [issue for that missing feature in libsass](https://github.com/sass/libsass/issues/21).

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
