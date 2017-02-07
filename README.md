[![npm][npm]][npm-url]
[![deps][deps]][deps-url]
[![test][test]][test-url]

<div align="center">
  <img height="100"
    src="https://worldvectorlogo.com/logos/sass-1.svg">
  <a href="https://github.com/webpack/webpack">
    <img height="100"
      src="https://github.com/webpack/media/raw/master/logo/logo-on-white-bg.png?raw=true">
  </a>
  <h1>sass-loader</h1>
  <p>Compiles Sass to CSS.<br>Use the <a href="https://github.com/webpack/css-loader">css-loader</a> or the <a href="https://github.com/webpack/raw-loader">raw-loader</a> to turn it into a JS module and the <a href="https://github.com/webpack/extract-text-webpack-plugin">ExtractTextPlugin</a> to extract it into a separate file.<p>
  <p>Looking for the webpack 1 loader? Check out the <a href="https://github.com/jtangelder/sass-loader/tree/archive/webpack-1">archive/webpack-1 branch</a>.</p>
</div>

## Install

```bash
npm install sass-loader node-sass webpack --save-dev
```

The sass-loader requires [node-sass](https://github.com/sass/node-sass) and [webpack](https://github.com/webpack/webpack)
as [`peerDependency`](https://docs.npmjs.com/files/package.json#peerdependencies). Thus you are able to control the versions accurately.

## Examples

Chain the sass-loader with the [css-loader](https://github.com/webpack/css-loader) and the [style-loader](https://github.com/webpack/style-loader) to immediately apply all styles to the DOM.

```js
// webpack.config.js
module.exports = {
	...
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "sass-loader" // compiles Sass to CSS
            }]
        }]
    }
};
```

You can also pass options directly to [node-sass](https://github.com/andrew/node-sass) by specifying an `options` property like this:

```js
// webpack.config.js
module.exports = {
	...
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader"
            }, {
                loader: "sass-loader",
                options: {
                    includePaths: ["absolute/path/a", "absolute/path/b"]
                }
            }]
        }]
    }
};
```

See [node-sass](https://github.com/andrew/node-sass) for all available Sass options.

### In production

Usually, it's recommended to extract the stylesheets into a dedicated file in production using the [ExtractTextPlugin](https://github.com/webpack/extract-text-webpack-plugin). This way your styles are not dependent on JavaScript:

```js
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = {
	...
    module: {
        rules: [{
            test: /\.scss$/,
            loader: extractSass.extract({
                loader: [{
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
                // use style-loader in development
                fallbackLoader: "style-loader"
            })
        }]
    },
    plugins: [
        extractSass
    ]
};
```

## Usage

### Imports

webpack provides an [advanced mechanism to resolve files](http://webpack.github.io/docs/resolving.html). The sass-loader uses node-sass' custom importer feature to pass all queries to the webpack resolving engine. Thus you can import your Sass modules from `node_modules`. Just prepend them with a `~` to tell webpack that this is not a relative import:

```css
@import "~bootstrap/css/bootstrap";
```

It's important to only prepend it with `~`, because `~/` resolves to the home directory. webpack needs to distinguish between `bootstrap` and `~bootstrap` because CSS and Sass files have no special syntax for importing relative files. Writing `@import "file"` is the same as `@import "./file";`

### Environment variables

If you want to prepend Sass code before the actual entry file, you can simply set the `data` option. In this case, the sass-loader will not override the `data` option but just append the entry's content. This is especially useful when some of your Sass variables depend on the environment:

```javascript
{
    loader: "sass-loader",
    options: {
        data: "$env: " + process.env.NODE_ENV + ";"
    }
}
```


### Problems with `url(...)`

Since Sass/[libsass](https://github.com/sass/libsass) does not provide [url rewriting](https://github.com/sass/libsass/issues/532), all linked assets must be relative to the output.

- If you're just generating CSS without passing it to the css-loader, it must be relative to your web root.
- If you pass the generated CSS on to the css-loader, all urls must be relative to the entry-file (e.g. `main.scss`).

More likely you will be disrupted by this second issue. It is natural to expect relative references to be resolved against the `.scss` file in which they are specified (like in regular `.css` files). Thankfully there are a two solutions to this problem:

- Add the missing url rewriting using the [resolve-url-loader](https://github.com/bholloway/resolve-url-loader). Place it directly after the sass-loader in the loader chain.
- Library authors usually provide a variable to modify the asset path. [bootstrap-sass](https://github.com/twbs/bootstrap-sass) for example has an `$icon-font-path`. Check out [this working bootstrap example](https://github.com/jtangelder/sass-loader/tree/master/test/bootstrapSass).

### Extracting stylesheets

Bundling CSS with webpack has some nice advantages like referencing images and fonts with hashed urls or [hot module replacement](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html) in development. In production, on the other hand, it's not a good idea to apply your stylesheets depending on JS execution. Rendering may be delayed or even a [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content) might be visible. Thus it's often still better to have them as separate files in your final production build.

There are two possibilties to extract a stylesheet from the bundle:

- [extract-loader](https://github.com/peerigon/extract-loader) (simpler, but specialized on the css-loader's output)
- [extract-text-webpack-plugin](https://github.com/webpack/extract-text-webpack-plugin) (more complex, but works in all use-cases)

### Source maps

To enable CSS source maps, you'll need to pass the `sourceMap` option to the sass-loader *and* the css-loader. Your `webpack.config.js` should look like this:

```javascript
module.exports = {
    ...
    devtool: "source-map", // any "source-map"-like devtool is possible
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader", options: {
                    sourceMap: true
                }
            }, {
                loader: "sass-loader", options: {
                    sourceMap: true
                }
            }]
        }]
    }
};
```

If you want to edit the original Sass files inside Chrome, [there's a good blog post](https://medium.com/@toolmantim/getting-started-with-css-sourcemaps-and-in-browser-sass-editing-b4daab987fb0). Checkout [test/sourceMap](https://github.com/jtangelder/sass-loader/tree/master/test) for a running example.


## Maintainers

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150 height="150"
        src="https://avatars0.githubusercontent.com/u/781746?v=3"><br>
        <a href="https://github.com/jhnns">Johannes Ewald</a>
      </td>
      <td align="center">
        <img width="150 height="150"
        src="https://avatars1.githubusercontent.com/u/1243901?v=3&s=460"><br>
        <a href="https://github.com/jtangelder">Jorik Tangelder</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars1.githubusercontent.com/u/3403295?v=3"><br>
        <a href="https://github.com/akiran">Kiran</a>
      </td>
    <tr>
  <tbody>
</table>


## License

[MIT](http://www.opensource.org/licenses/mit-license.php)


[npm]: https://img.shields.io/npm/v/sass-loader.svg
[npm-url]: https://npmjs.com/package/sass-loader

[deps]: https://david-dm.org/jtangelder/sass-loader.svg
[deps-url]: https://david-dm.org/jtangelder/sass-loader

[test]: http://img.shields.io/travis/jtangelder/sass-loader.svg
[test-url]: https://travis-ci.org/jtangelder/sass-loader
