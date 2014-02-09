# sass loader for webpack

## Usage

``` javascript
var css = require("!sass!./file.scss");
// => returns compiled css code from file.scss
```

Use in tandem with the [`style-loader`](https://github.com/webpack/style-loader) to add the css rules to your document:

``` javascript
require("!style!css!sass!./file.scss");
```

### webpack config

``` javascript
module.exports = {
  module: {
    loaders: [
      {
        test: /\.scss|\.sass$/,
        loader: "style-loader!css-loader!sass-loader"
      }
    ]
  }
};
```

Then you only need to write: `require("./file.scss")`

## License

MIT (http://www.opensource.org/licenses/mit-license.php)