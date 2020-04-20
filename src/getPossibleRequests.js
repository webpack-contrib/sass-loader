import path from 'path';

import utils from 'loader-utils';

// Examples:
// - ~package
// - ~package/
// - ~@org
// - ~@org/
// - ~@org/package
// - ~@org/package/
const matchModuleImport = /^~([^/]+|[^/]+\/|@[^/]+[/][^/]+|@[^/]+\/?|@[^/]+[/][^/]+\/)$/;

/**
 * When libsass tries to resolve an import, it uses a special algorithm.
 * Since the sass-loader uses webpack to resolve the modules, we need to simulate that algorithm. This function
 * returns an array of import paths to try. The last entry in the array is always the original url
 * to enable straight-forward webpack.config aliases.
 *
 * @param {string} url
 * @param {boolean} forWebpackResolver
 * @returns {Array<string>}
 */
export default function getPossibleRequests(url, forWebpackResolver = false) {
  const request = utils.urlToRequest(url);

  // In case there is module request, send this to webpack resolver
  if (forWebpackResolver && matchModuleImport.test(url)) {
    return [request, url];
  }

  // Keep in mind: ext can also be something like '.datepicker' when the true extension is omitted and the filename contains a dot.
  // @see https://github.com/webpack-contrib/sass-loader/issues/167
  const ext = path.extname(request).toLowerCase();

  // Because @import is also defined in CSS, Sass needs a way of compiling plain CSS @imports without trying to import the files at compile time.
  // To accomplish this, and to ensure SCSS is as much of a superset of CSS as possible, Sass will compile any @imports with the following characteristics to plain CSS imports:
  //  - imports where the URL ends with .css.
  //  - imports where the URL begins http:// or https://.
  //  - imports where the URL is written as a url().
  //  - imports that have media queries.
  //
  // The `node-sass` package sends `@import` ending on `.css` to importer, it is bug, so we skip resolve
  if (ext === '.css') {
    return [];
  }

  const dirname = path.dirname(request);
  const basename = path.basename(request);

  // In case there is file extension:
  //
  // 1. Try to resolve `_` file.
  // 2. Try to resolve file without `_`.
  // 3. Send a original url to webpack resolver, maybe it is alias for webpack resolving.
  if (['.scss', '.sass', '.css'].includes(ext)) {
    return [`${dirname}/_${basename}`, `${dirname}/${basename}`].concat(
      forWebpackResolver ? [url] : []
    );
  }

  // In case there is no file extension
  //
  // 1. Try to resolve files starts with `_` and normal with order `sass`, `scss` and `css`.
  // 2. Send a original url to webpack resolver, maybe it is alias for webpack resolving.
  return [
    `${dirname}/_${basename}.sass`,
    `${dirname}/${basename}.sass`,
    `${dirname}/_${basename}.scss`,
    `${dirname}/${basename}.scss`,
    `${dirname}/_${basename}.css`,
    `${dirname}/${basename}.css`,
    `${dirname}/${basename}/_index.sass`,
    `${dirname}/${basename}/index.sass`,
    `${dirname}/${basename}/_index.scss`,
    `${dirname}/${basename}/index.scss`,
    `${dirname}/${basename}/_index.css`,
    `${dirname}/${basename}/index.css`,
  ].concat(forWebpackResolver ? [request, url] : []);
}
