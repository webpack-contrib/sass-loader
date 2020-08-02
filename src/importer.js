import { getSassImplementation, getWebpackResolver } from './utils';

/**
 * A factory function for creating a Sass importer that uses `sass-loader`'s
 * resolution rules.
 *
 * @see https://sass-lang.com/documentation/js-api#importer
 *
 * This is useful when attempting to mimic `sass-loader`'s behaviour in contexts
 * that do not support Webpack. For example, it could be used to write a Jest
 * transform for testing files with Sass imports.
 *
 * The resulting Sass importer is asynchronous, so it can only be used with
 * `sass.render()` and not `renderSync()`.
 *
 * Example usage:
 * ```js
 *   import sass from 'sass';
 *   import resolve from 'enhanced-resolve';
 *   import createImporter from 'sass-loader/dist/importer';
 *   import webpackConfig = './webpack.config';
 *
 *   const { resolve: { alias } } = webpackConfig;
 *   const resolverFactory = (options) => resolve.create({ alias, ...options });
 *   const importer = createImporter(resolverFactory, sass);
 *
 *   sass.render({
 *     file: 'input.scss',
 *     importer,
 *   }, (err, result) => {
 *     // ...
 *   });
 * ```
 *
 * @param {Function} resolverFactory - A factory function for creating a Webpack
 *   resolver. The resulting `resolve` function should be compatible with the
 *   asynchronous resolve function supplied by [`enhanced-resolve`]{@link
 *   https://github.com/webpack/enhanced-resolve}. In all likelihood you'll want
 *   to pass `resolve.create()` from `enhanced-resolve`, or a wrapped copy of
 *   it.
 * @param {Object} [implementation] - The imported Sass implementation, both
 *   `sass` (Dart Sass)  and `node-sass` are supported. If no implementation is
 *   supplied, `sass` will be preferred if it's available.
 * @param {string[]} [includePaths] - The list of include paths passed to Sass.
 *
 * @returns {Function}
 */
export default function createSassImporter(
  resolverFactory,
  implementation = null,
  includePaths = []
) {
  if (!implementation) {
    // eslint-disable-next-line no-param-reassign
    implementation = getSassImplementation();
  }

  const resolve = getWebpackResolver(
    implementation,
    resolverFactory,
    includePaths
  );

  return (url, prev, done) => {
    resolve(prev, url)
      .then((result) => {
        done({ file: result });
      })
      .catch(() => {
        done(null);
      });
  };
}
