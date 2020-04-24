/**
 * @name Importer
 * @type {Function}
 * @param {string} url
 * @param {string} prev
 * @param {Function<Error, string>} done
 */

import path from 'path';

import getPossibleRequests from './getPossibleRequests';

const matchCss = /\.css$/i;

/**
 * Returns an importer that uses webpack's resolving algorithm.
 *
 * It's important that the returned function has the correct number of arguments
 * (based on whether the call is sync or async) because otherwise node-sass doesn't exit.
 *
 */
function webpackImporter(loaderContext, includePaths) {
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
  // TODO implement the `restrictions` option for `enhanced-resolve` and avoid resolution `js` files from the `mainFields`
  // TODO avoid resolsing `_index`, `index` and files without extensions
  // TODO avoid resolving with multiple extensions - `file.sass.sass`/`file.sass.scss`/`file.sass.css`
  const webpackResolve = loaderContext.getResolve({
    mainFields: ['sass', 'style', 'main', '...'],
    mainFiles: ['_index', 'index', '...'],
    extensions: ['.sass', '.scss', '.css'],
  });

  return (originalUrl, prev, done) => {
    let url = originalUrl;

    const isFileScheme = originalUrl.startsWith('file:');

    if (isFileScheme) {
      // eslint-disable-next-line no-param-reassign
      url = originalUrl.slice(5);
    }

    let resolutionMap = [];

    if (includePaths.length > 0 && !isFileScheme) {
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

export default webpackImporter;
