# sass loader for webpack


## Usage

``` javascript
var css = require("!sass!./file.scss");
// => returns compiled css code from file.scss
```

Use in tandem with the [`style-loader`](https://github.com/webpack/style-loader) to add the css rules to your document:

``` javascript
require("!style!sass!./file.scss");
```

### webpack config

``` javascript
module.exports = {
  module: {
    loaders: [
      {
        test: /\.scss|\.sass$/,
        loader: "style-loader!sass-loader?outputStyle=expanded"
      }
    ]
  }
};
```

Then you only need to write: `require("./file.scss")`

## Install

`npm install sass-loader`

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
