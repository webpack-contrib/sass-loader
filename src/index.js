import path from 'path';

import { validate } from 'schema-utils';
import { getOptions } from 'loader-utils';

import schema from './options.json';
import {
  getSassImplementation,
  getSassOptions,
  getWebpackImporter,
  getRenderFunctionFromSassImplementation,
  normalizeSourceMap,
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

  validate(schema, options, {
    name: 'Sass Loader',
    baseDataPath: 'options',
  });

  const implementation = getSassImplementation(options.implementation);
  const useSourceMap =
    typeof options.sourceMap === 'boolean' ? options.sourceMap : this.sourceMap;
  const sassOptions = getSassOptions(
    this,
    options,
    content,
    implementation,
    useSourceMap
  );
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

    let map = result.map ? JSON.parse(result.map) : null;

    // Modify source paths only for webpack, otherwise we do nothing
    if (map && useSourceMap) {
      map = normalizeSourceMap(map, this.rootContext);
    }

    result.stats.includedFiles.forEach((includedFile) => {
      this.addDependency(path.normalize(includedFile));
    });

    callback(null, result.css.toString(), map);
  });
}

export default loader;
