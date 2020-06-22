import path from 'path';

import semver from 'semver';
import cloneDeep from 'clone-deep';
import { urlToRequest } from 'loader-utils';
import async from 'neo-async';

function getDefaultSassImplementation() {
  let sassImplPkg = 'sass';

  try {
    require.resolve('sass');
  } catch (error) {
    try {
      require.resolve('node-sass');
      sassImplPkg = 'node-sass';
    } catch (ignoreError) {
      sassImplPkg = 'sass';
    }
  }

  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(sassImplPkg);
}

function getSassImplementation(implementation) {
  let resolvedImplementation = implementation;

  if (!resolvedImplementation) {
    // eslint-disable-next-line no-param-reassign
    resolvedImplementation = getDefaultSassImplementation();
  }

  const { info } = resolvedImplementation;

  if (!info) {
    throw new Error('Unknown Sass implementation.');
  }

  const infoParts = info.split('\t');

  if (infoParts.length < 2) {
    throw new Error(`Unknown Sass implementation "${info}".`);
  }

  const [implementationName, version] = infoParts;

  if (implementationName === 'dart-sass') {
    if (!semver.satisfies(version, '^1.3.0')) {
      throw new Error(
        `Dart Sass version ${version} is incompatible with ^1.3.0.`
      );
    }

    return resolvedImplementation;
  } else if (implementationName === 'node-sass') {
    if (!semver.satisfies(version, '^4.0.0')) {
      throw new Error(
        `Node Sass version ${version} is incompatible with ^4.0.0.`
      );
    }

    return resolvedImplementation;
  }

  throw new Error(`Unknown Sass implementation "${implementationName}".`);
}

function isProductionLikeMode(loaderContext) {
  return loaderContext.mode === 'production' || !loaderContext.mode;
}

function proxyCustomImporters(importers, loaderContext) {
  return [].concat(importers).map((importer) => {
    return function proxyImporter(...args) {
      this.webpackLoaderContext = loaderContext;

      return importer.apply(this, args);
    };
  });
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

  options.file = loaderContext.resourcePath;
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
    options.sourceMap = path.join(process.cwd(), '/sass.css.map');
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

  // Allow passing custom importers to `sass`/`node-sass`. Accepts `Function` or an array of `Function`s.
  options.importer = options.importer
    ? proxyCustomImporters(
        Array.isArray(options.importer) ? options.importer : [options.importer],
        loaderContext
      )
    : [];

  options.includePaths = []
    .concat(process.cwd())
    .concat(options.includePaths || [])
    .concat(
      process.env.SASS_PATH
        ? process.env.SASS_PATH.split(process.platform === 'win32' ? ';' : ':')
        : []
    );

  return options;
}

// Examples:
// - ~package
// - ~package/
// - ~@org
// - ~@org/
// - ~@org/package
// - ~@org/package/
const isModuleImport = /^~([^/]+|[^/]+\/|@[^/]+[/][^/]+|@[^/]+\/?|@[^/]+[/][^/]+\/)$/;

/**
 * When `sass`/`node-sass` tries to resolve an import, it uses a special algorithm.
 * Since the `sass-loader` uses webpack to resolve the modules, we need to simulate that algorithm.
 * This function returns an array of import paths to try.
 * The last entry in the array is always the original url to enable straight-forward webpack.config aliases.
 *
 * We don't need emulate `dart-sass` "It's not clear which file to import." errors (when "file.ext" and "_file.ext" files are present simultaneously in the same directory).
 * This reduces performance and `dart-sass` always do it on own side.
 *
 * @param {string} url
 * @param {boolean} forWebpackResolver
 * @returns {Array<string>}
 */
export default function getPossibleRequests(url, forWebpackResolver = false) {
  const request = urlToRequest(url);

  // In case there is module request, send this to webpack resolver
  if (forWebpackResolver && isModuleImport.test(url)) {
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

const matchCss = /\.css$/i;
const isSpecialModuleImport = /^~[^/]+$/;

/**
 * Returns an importer that uses webpack's resolving algorithm.
 *
 * It's important that the returned function has the correct number of arguments
 * (based on whether the call is sync or async) because otherwise node-sass doesn't exit.
 *
 */
function getWebpackImporter(loaderContext, includePaths) {
  function startResolving(resolutionMap) {
    if (resolutionMap.length === 0) {
      return Promise.reject();
    }

    const [{ resolve, context, possibleRequests }] = resolutionMap;

    return resolve(context, possibleRequests[0])
      .then((result) => {
        // Add the result as dependency.
        // Although we're also using stats.includedFiles, this might come in handy when an error occurs.
        // In this case, we don't get stats.includedFiles from node-sass/sass.
        loaderContext.addDependency(path.normalize(result));

        // By removing the CSS file extension, we trigger node-sass to include the CSS file instead of just linking it.
        return { file: result.replace(matchCss, '') };
      })
      .catch(() => {
        const [, ...tailResult] = possibleRequests;

        if (tailResult.length === 0) {
          const [, ...tailResolutionMap] = resolutionMap;

          return startResolving(tailResolutionMap);
        }

        // eslint-disable-next-line no-param-reassign
        resolutionMap[0].possibleRequests = tailResult;

        return startResolving(resolutionMap);
      });
  }

  // We can't use `loaderContext.resolve` because it resolves values from default `extensions`/`mainFields`/etc from webpack configuration
  const sassResolve = loaderContext.getResolve({
    alias: [],
    aliasFields: [],
    descriptionFiles: [],
    extensions: [],
    mainFields: [],
    mainFiles: [],
    modules: [],
  });
  const webpackResolve = loaderContext.getResolve({
    mainFields: ['sass', 'style', 'main', '...'],
    mainFiles: ['_index', 'index', '...'],
    extensions: ['.sass', '.scss', '.css'],
    restrictions: [/\.((sa|sc|c)ss)$/i],
  });

  return (originalUrl, prev, done) => {
    let url = originalUrl;

    const isFileScheme = originalUrl.startsWith('file:');

    if (isFileScheme) {
      // eslint-disable-next-line no-param-reassign
      url = originalUrl.slice(5);
    }

    let resolutionMap = [];

    if (
      includePaths.length > 0 &&
      !isFileScheme &&
      !isSpecialModuleImport.test(url)
    ) {
      // The order of import precedence is as follows:
      //
      // 1. Filesystem imports relative to the base file.
      // 2. Custom importer imports.
      // 3. Filesystem imports relative to the working directory.
      // 4. Filesystem imports relative to an `includePaths` path.
      // 5. Filesystem imports relative to a `SASS_PATH` path.
      //
      // Because `sass`/`node-sass` run custom importers before `3`, `4` and `5` points, we need to emulate this behavior to avoid wrong resolution.
      const sassPossibleRequests = getPossibleRequests(url);

      resolutionMap = resolutionMap.concat(
        includePaths.map((context) => ({
          resolve: sassResolve,
          context,
          possibleRequests: sassPossibleRequests,
        }))
      );
    }

    const webpackPossibleRequests = getPossibleRequests(url, true);

    resolutionMap = resolutionMap.concat({
      resolve: webpackResolve,
      context: isFileScheme ? '/' : path.dirname(prev),
      possibleRequests: webpackPossibleRequests,
    });

    startResolving(resolutionMap)
      // Catch all resolving errors, return the original file and pass responsibility back to other custom importers
      .catch(() => ({ file: originalUrl }))
      .then(done);
  };
}

let nodeSassJobQueue = null;

/**
 * Verifies that the implementation and version of Sass is supported by this loader.
 *
 * @param {Object} implementation
 * @returns {Function}
 */
function getRenderFunctionFromSassImplementation(implementation) {
  const isDartSass = implementation.info.includes('dart-sass');

  if (isDartSass) {
    return implementation.render.bind(implementation);
  }

  // There is an issue with node-sass when async custom importers are used
  // See https://github.com/sass/node-sass/issues/857#issuecomment-93594360
  // We need to use a job queue to make sure that one thread is always available to the UV lib
  if (nodeSassJobQueue === null) {
    const threadPoolSize = Number(process.env.UV_THREADPOOL_SIZE || 4);

    nodeSassJobQueue = async.queue(
      implementation.render.bind(implementation),
      threadPoolSize - 1
    );
  }

  return nodeSassJobQueue.push.bind(nodeSassJobQueue);
}

export {
  getSassImplementation,
  getSassOptions,
  getWebpackImporter,
  getRenderFunctionFromSassImplementation,
};
