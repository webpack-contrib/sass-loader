/**
 * @name PromisedResolve
 * @type {Function}
 * @param {string} dir
 * @param {string} request
 * @returns Promise
 */

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
function webpackImporter(loaderContext, resolve, includePaths) {
  function dirContextFrom(fileContext) {
    return path.dirname(
      // The first file is 'stdin' when we're using the data option
      fileContext === 'stdin' ? loaderContext.resourcePath : fileContext
    );
  }

  function startResolving(resolutionMap) {
    if (resolutionMap.length === 0) {
      return Promise.reject();
    }

    const [{ context, possibleRequests }] = resolutionMap;

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

  return (url, prev, done) => {
    const possibleRequests = getPossibleRequests(url);
    const resolutionMap = []
      .concat(includePaths)
      .concat(dirContextFrom(prev))
      .map((context) => ({ context, possibleRequests }));

    startResolving(resolutionMap)
      // Catch all resolving errors, return the original file and pass responsibility back to other custom importers
      .catch(() => ({ file: url }))
      .then(done);
  };
}

export default webpackImporter;
