import path from 'path';

import cloneDeep from 'clone-deep';

import proxyCustomImporters from './proxyCustomImporters';

function isProductionLikeMode(loaderContext) {
  return (
    loaderContext.mode === 'production' ||
    !loaderContext.mode ||
    loaderContext.minimize
  );
}

/**
 * Derives the sass options from the loader context and normalizes its values with sane defaults.
 *
 * @param {object} loaderContext
 * @param {object} loaderOptions
 * @param {string} content
 * @param {object} implementation
 * @returns {Object}
 */
function getSassOptions(loaderContext, loaderOptions, content, implementation) {
  const options = cloneDeep(
    loaderOptions.sassOptions
      ? typeof loaderOptions.sassOptions === 'function'
        ? loaderOptions.sassOptions(loaderContext) || {}
        : loaderOptions.sassOptions
      : {}
  );

  const isDartSass = implementation.info.includes('dart-sass');

  if (isDartSass) {
    const shouldTryToResolveFibers = !options.fiber && options.fiber !== false;

    if (shouldTryToResolveFibers) {
      let fibers;

      try {
        fibers = require.resolve('fibers');
      } catch (_error) {
        // Nothing
      }

      if (fibers) {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        options.fiber = require(fibers);
      }
    } else if (options.fiber === false) {
      // Don't pass the `fiber` option for `sass` (`Dart Sass`)
      delete options.fiber;
    }
  } else {
    // Don't pass the `fiber` option for `node-sass`
    delete options.fiber;
  }

  options.data = loaderOptions.prependData
    ? typeof loaderOptions.prependData === 'function'
      ? `${loaderOptions.prependData(loaderContext)}\n${content}`
      : `${loaderOptions.prependData}\n${content}`
    : content;

  // opt.outputStyle
  if (!options.outputStyle && isProductionLikeMode(loaderContext)) {
    options.outputStyle = 'compressed';
  }

  const useSourceMap =
    typeof loaderOptions.sourceMap === 'boolean'
      ? loaderOptions.sourceMap
      : loaderContext.sourceMap;

  if (useSourceMap) {
    // Deliberately overriding the sourceMap option here.
    // node-sass won't produce source maps if the data option is used and options.sourceMap is not a string.
    // In case it is a string, options.sourceMap should be a path where the source map is written.
    // But since we're using the data option, the source map will not actually be written, but
    // all paths in sourceMap.sources will be relative to that path.
    // Pretty complicated... :(
    options.sourceMap = path.join(process.cwd(), '/sass.map');
    options.sourceMapRoot = process.cwd();
    options.sourceMapContents = true;
    options.omitSourceMapUrl = true;
    options.sourceMapEmbed = false;
  }

  const { resourcePath } = loaderContext;
  const ext = path.extname(resourcePath);

  // If we are compiling sass and indentedSyntax isn't set, automatically set it.
  if (
    ext &&
    ext.toLowerCase() === '.sass' &&
    typeof options.indentedSyntax === 'undefined'
  ) {
    options.indentedSyntax = true;
  } else {
    options.indentedSyntax = Boolean(options.indentedSyntax);
  }

  // Allow passing custom importers to `node-sass`. Accepts `Function` or an array of `Function`s.
  options.importer = options.importer
    ? proxyCustomImporters(options.importer, resourcePath)
    : [];

  options.includePaths = []
    .concat(options.includePaths || [])
    .concat(
      process.env.SASS_PATH
        ? process.env.SASS_PATH.split(process.platform === 'win32' ? ';' : ':')
        : []
    )
    .concat(process.cwd())
    .concat(path.dirname(resourcePath));

  return options;
}

export default getSassOptions;
