import path from 'path';

import validateOptions from 'schema-utils';
import { getOptions } from 'loader-utils';

import schema from './options.json';
import {
  getSassImplementation,
  getSassOptions,
  getWebpackImporter,
  getRenderFunctionFromSassImplementation,
} from './utils';
import SassError from './SassError';

/**
 * The sass-loader makes node-sass and dart-sass available to webpack modules.
 *
 * @this {object}
 * @param {string} content
 */
function loader(content) {
  const options = getOptions(this);

  validateOptions(schema, options, {
    name: 'Sass Loader',
    baseDataPath: 'options',
  });

  const implementation = getSassImplementation(options.implementation);
  const sassOptions = getSassOptions(this, options, content, implementation);

  const shouldUseWebpackImporter =
    typeof options.webpackImporter === 'boolean'
      ? options.webpackImporter
      : true;

  if (shouldUseWebpackImporter) {
    const { includePaths } = sassOptions;

    sassOptions.importer.push(
      getWebpackImporter(this, implementation, includePaths)
    );
  }

  const callback = this.async();
  const render = getRenderFunctionFromSassImplementation(implementation);

  render(sassOptions, (error, result) => {
    if (error) {
      // There are situations when the `file` property do not exist
      if (error.file) {
        // `node-sass` returns POSIX paths
        this.addDependency(path.normalize(error.file));
      }

      callback(new SassError(error));

      return;
    }

    if (result.map) {
      // eslint-disable-next-line no-param-reassign
      result.map = JSON.parse(result.map);

      // result.map.file is an optional property that provides the output filename.
      // Since we don't know the final filename in the webpack build chain yet, it makes no sense to have it.
      // eslint-disable-next-line no-param-reassign
      delete result.map.file;

      // eslint-disable-next-line no-param-reassign
      result.sourceRoot = '';

      // node-sass returns POSIX paths, that's why we need to transform them back to native paths.
      // This fixes an error on windows where the source-map module cannot resolve the source maps.
      // @see https://github.com/webpack-contrib/sass-loader/issues/366#issuecomment-279460722
      // eslint-disable-next-line no-param-reassign
      result.map.sources = result.map.sources.map((source) =>
        path.resolve(this.rootContext, path.normalize(source))
      );
    }

    result.stats.includedFiles.forEach((includedFile) => {
      this.addDependency(path.normalize(includedFile));
    });

    callback(null, result.css.toString(), result.map);
  });
}

export default loader;
