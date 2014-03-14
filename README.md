# sass loader for [webpack](http://webpack.github.io/)


## Usage

``` javascript
var css = require("sass!./file.scss");
// => returns compiled css code from file.scss
```

Typically you'd use the sass-loader in tandem with the [`css-loader`](https://github.com/webpack/css-loader) and the [`style-loader`](https://github.com/webpack/style-loader) to resolve `url()` statements and to add the generated css to your document:

``` javascript
require("style!css!sass!./file.scss");
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

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
