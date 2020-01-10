import path from 'path';

import validateOptions from 'schema-utils';
import { getOptions } from 'loader-utils';

import schema from './options.json';
import getSassImplementation from './getSassImplementation';
import getSassOptions from './getSassOptions';
import webpackImporter from './webpackImporter';
import getRenderFunctionFromSassImplementation from './getRenderFunctionFromSassImplementation';
import SassError from './SassError';

/**
 * The sass-loader makes node-sass and dart-sass available to webpack modules.
 *
 * @this {object}
 * @param {string} content
 */
function loader(content) {
  const options = getOptions(this) || {};

  validateOptions(schema, options, {
    name: 'Sass Loader',
    baseDataPath: 'options',
  });

  const implementation = getSassImplementation(options.implementation);

  const callback = this.async();
  const addNormalizedDependency = (file) => {
    // node-sass returns POSIX paths
    this.addDependency(path.normalize(file));
  };

  const sassOptions = getSassOptions(this, options, content, implementation);

  const shouldUseWebpackImporter =
    typeof options.webpackImporter === 'boolean'
      ? options.webpackImporter
      : true;

  if (shouldUseWebpackImporter) {
    const resolve = this.getResolve({
      mainFields: ['sass', 'style', 'main', '...'],
      mainFiles: ['_index', 'index', '...'],
      extensions: ['.scss', '.sass', '.css', '...'],
    });

    sassOptions.importer.push(
      webpackImporter(this.resourcePath, resolve, addNormalizedDependency)
    );
  }

  // Skip empty files, otherwise it will stop webpack, see issue #21
  if (sassOptions.data.trim() === '') {
    callback(null, '');
    return;
  }

  const render = getRenderFunctionFromSassImplementation(implementation);

  render(sassOptions, (error, result) => {
    if (error) {
      if (error.file) {
        addNormalizedDependency(error.file);
      }

      callback(new SassError(error, this.resourcePath));

      return;
    }

    if (result.map && result.map !== '{}') {
      // eslint-disable-next-line no-param-reassign
      result.map = JSON.parse(result.map);

      // result.map.file is an optional property that provides the output filename.
      // Since we don't know the final filename in the webpack build chain yet, it makes no sense to have it.
      // eslint-disable-next-line no-param-reassign
      delete result.map.file;

      // One of the sources is 'stdin' according to dart-sass/node-sass because we've used the data input.
      // Now let's override that value with the correct relative path.
      // Since we specified options.sourceMap = path.join(process.cwd(), "/sass.map"); in getSassOptions,
      // we know that this path is relative to process.cwd(). This is how node-sass works.
      // eslint-disable-next-line no-param-reassign
      const stdinIndex = result.map.sources.findIndex((source) =>
        source.includes('stdin')
      );

      if (stdinIndex !== -1) {
        // eslint-disable-next-line no-param-reassign
        result.map.sources[stdinIndex] = path.relative(
          process.cwd(),
          this.resourcePath
        );
      }

      // node-sass returns POSIX paths, that's why we need to transform them back to native paths.
      // This fixes an error on windows where the source-map module cannot resolve the source maps.
      // @see https://github.com/webpack-contrib/sass-loader/issues/366#issuecomment-279460722
      // eslint-disable-next-line no-param-reassign
      result.map.sourceRoot = path.normalize(result.map.sourceRoot);
      // eslint-disable-next-line no-param-reassign
      result.map.sources = result.map.sources.map(path.normalize);
    } else {
      // eslint-disable-next-line no-param-reassign
      result.map = null;
    }

    result.stats.includedFiles.forEach(addNormalizedDependency);

    callback(null, result.css.toString(), result.map);
  });
}

export default loader;
