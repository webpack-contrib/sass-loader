# Sass loader for [webpack](http://webpack.github.io/)

## Install

`npm install sass-loader node-sass webpack --save-dev`

The sass-loader requires [node-sass](https://github.com/sass/node-sass) and [webpack](https://github.com/webpack/webpack)
as [`peerDependency`](https://docs.npmjs.com/files/package.json#peerdependencies). Thus you are able to specify the required versions accurately.

---

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

``` javascript
var css = require("!raw-loader!sass-loader!./file.scss");
// returns compiled css code from file.scss, resolves Sass imports
var css = require("!css-loader!sass-loader!./file.scss");
// returns compiled css code from file.scss, resolves Sass and CSS imports and url(...)s
```

Use in tandem with the [`style-loader`](https://github.com/webpack/style-loader) and [`css-loader`](https://github.com/webpack/css-loader) to add the css rules to your document:

``` javascript
require("!style-loader!css-loader!sass-loader!./file.scss");
```
*Please note: If you encounter module errors complaining about a missing `style` or `css` module, make sure you have installed all required loaders via npm.*

### Apply via webpack config

It's recommended to adjust your `webpack.config` so `style-loader!css-loader!sass-loader!` is applied automatically on all files ending on `.scss`:

``` javascript
module.exports = {
  ...
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  }
};
```

Then you only need to write: `require("./file.scss")`.

### Sass options

You can pass options to node-sass by defining a `sassLoader` property on your `webpack.config.js`. See [node-sass](https://github.com/andrew/node-sass) for all available Sass options.

```javascript
module.exports = {
  ...
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, "./some-folder")]
  }
};
```

Passing your options as [query parameters](http://webpack.github.io/docs/using-loaders.html#query-parameters) is also supported, but can get confusing if you need to set a lot of options.

If you need to define two different loader configs, you can also change the config's property name via `sass-loader?config=otherSassLoaderConfig`:

```javascript
module.exports = {
  ...
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader?config=otherSassLoaderConfig"]
      }
    ]
  },
  otherSassLoaderConfig: {
    ...
  }
};
```

### Imports

webpack provides an [advanced mechanism to resolve files](http://webpack.github.io/docs/resolving.html). The sass-loader uses node-sass' custom importer feature to pass all queries to the webpack resolving engine. Thus you can import your Sass modules from `node_modules`. Just prepend them with a `~` to tell webpack that this is not a relative import:

```css
@import "~bootstrap/css/bootstrap";
```

Alternatively, for bootstrap-sass:
```css
@import "~bootstrap-sass/assets/stylesheets/bootstrap";
```

It's important to only prepend it with `~`, because `~/` resolves to the home directory. webpack needs to distinguish between `bootstrap` and `~bootstrap` because CSS and Sass files have no special syntax for importing relative files. Writing `@import "file"` is the same as `@import "./file";`

### Environment variables

If you want to prepend Sass code before the actual entry file, you can simply set the `data` option. In this case, the sass-loader will not override the `data` option but just append the entry's content. This is especially useful when some of your Sass variables depend on the environment:

```javascript
module.exports = {
  ...
  sassLoader: {
    data: "$env: " + process.env.NODE_ENV + ";"
  }
};
```


#### Advanced: Doing wild things with a custom node-sass importer

node-sass's `importer` API allows you to define custom handlers for Sass's `@import` directive. While sass-loader defines its own importer callback to integrate `@import` with webpack's resolve mechanism, it will also pass along your own importer callback to node-sass. This allows your code a chance to "steal" the import and handle it, or pass on it and let sass-loader handle it as normal.

Why would you want to do this? Well, maybe you want your Sass to be able to `@import` something other than Sass or normal stylesheets... like Stylus, or LESS. You could write an importer that checks for the appropriate file extension, and invokes another compiler, replacing the `@import` with compiled CSS before it gets to node-sass. Or you could even transpile it to Sass.

Luckily, sass-loader won't get in your way if you want to do this. sass-loader will pass along your importer to node-sass and (as of 3.1.3) allow you to access webpack's loader API via `this.options.loaderContext`. For now, you'll have to handle the path resolution logic yourself, though, since path resolution and actual processing of imports are tightly coupled together.

Include your importer function in your sassLoader options, like this:

```javascript
var sass = require('node-sass');
module.exports = {
  ...
  module: {
    loaders: [{
      test: /\.scss$/,
      loaders: ['style', 'css', 'sass']
    }]
  },
  sassLoader: {
    importer: stylusImporter
  }
};
```
And then, use loader-util's and webpack's resolve in your importer:

```javascript
var loaderUtils = require('loader-utils');
var sass = require('node-sass');

function specialImporter (url, fileContext, done) {
  if (!shouldThisFileBeHandledByMyImporter(url)) {
    // Return sass.NULL in order to declare you wish to "pass" on this url and
    // let other importers handle it. Be careful, as this doesn't work correctly in
    // an environment with multiple copies of node-sass (e.g., if your importer is
    // inside of a symlinked package). This can manifest as a strange Sass error
    // like "No such mixin foo", when `foo` is @import'd from another Sass file.
    return sass.NULL;
  }

  // Let's run the URL through webpack's resolvers. Sass-loader includes the
  // dirname of the entry point file (the initially require()'d scss file) in
  // includePaths as the last entry.
  var includePaths = this.options.includePaths.split(':');

  // If we're given fileContext (and it's not 'stdin'), then fileContext is the
  // path of the file doing the import--i.e., the import we're processing is the
  // result of an @import from within Sass, rather than of a require() from
  // within JS.
  var workingDir = fileContext && fileContext !== 'stdin'
    ? path.dirname(fileContext)
    : includePaths[includePaths.length - 1];
  var filePath = loaderUtils.urlToRequest(url, workingDir);
  if (filePath[0] === '.') {
    filePath = path.resolve(workingDir, filePath);
  }

  var loaderContext = this.options.loaderContext;
  var resolve = loaderContext.resolve.bind(loaderContext);

  resolve(workingDir, filePath, function resolveCallback (err, filename) {
    if (err) done(err);

    // Tell Webpack about the file being part of the build.
    this.options.loaderContext.addDependency(filename);

    // Return the result or error via the `done` function:
    done({ contents: '/* Resulting Sass code goes here */' });
    // If there's an error, send an error object or the error you caught:
    // done(new Error('Helpful error message about the file'));
  }.bind(this));
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

To enable CSS Source maps, you'll need to pass the `sourceMap` option to the sass *and* the css-loader. Your `webpack.config.js` should look like this:

```javascript
module.exports = {
    ...
    devtool: "source-map", // or "inline-source-map"
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loaders: ["style-loader", "css-loader?sourceMap", "sass-loader?sourceMap"]
            }
        ]
    }
};
```

If you want to edit the original Sass files inside Chrome, [there's a good blog post](https://medium.com/@toolmantim/getting-started-with-css-sourcemaps-and-in-browser-sass-editing-b4daab987fb0). Checkout [test/sourceMap](https://github.com/jtangelder/sass-loader/tree/master/test) for a running example.

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
