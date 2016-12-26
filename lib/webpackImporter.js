"use strict";

const path = require("path");
const utils = require("loader-utils");
const importsToResolve = require("./importsToResolve");

const matchCss = /\.css$/;

/**
 * Returns an importer that uses webpack's resolving algorithm.
 *
 * It's important that the returned function has the correct number of arguments
 * (based on whether the call is sync or async) because otherwise node-sass doesn't exit.
 *
 * @param {string} resourcePath
 * @param {Function<string, string, Function<Error, string>>} loaderResolve
 * @param {Function<string>} addNormalizedDependency
 * @returns {Function<string, string, Function>}
 */
function webpackImporter(resourcePath, loaderResolve, addNormalizedDependency) {
    /**
     * Tries to resolve the first url of importsToResolve. If that resolve fails, the next url is tried.
     * If all imports fail, the import is passed to libsass which also take includePaths into account.
     *
     * @param {string} dirContext
     * @param {string} originalImport
     * @param {Array} importsToResolve
     * @param {Function} done
     */
    function resolve(dirContext, originalImport, importsToResolve, done) {
        const importToResolve = importsToResolve.shift();

        if (!importToResolve) {
            // No import possibilities left. Let's pass that one back to libsass...
            done({
                file: originalImport
            });
            return;
        }

        loaderResolve(dirContext, importToResolve, (err, resolvedFilename) => {
            if (err) {
                resolve(dirContext, originalImport, importsToResolve, done);
                return;
            }
            // Add the resolvedFilename as dependency. Although we're also using stats.includedFiles, this might come
            // in handy when an error occurs. In this case, we don't get stats.includedFiles from node-sass.
            addNormalizedDependency(resolvedFilename);
            // By removing the CSS file extension, we trigger node-sass to include the CSS file instead of just linking it.
            resolvedFilename = resolvedFilename.replace(matchCss, "");

            // Use self.loadModule() before calling done() to make imported files available to
            // other webpack tools like postLoaders etc.?

            done({
                file: resolvedFilename.replace(matchCss, "")
            });
        });
    }

    function dirContextFrom(fileContext) {
        return path.dirname(
            // The first file is 'stdin' when we're using the data option
            fileContext === "stdin" ? resourcePath : fileContext
        );
    }

    return (url, prev, done) => {
        resolve(
            dirContextFrom(
                // node-sass returns UNIX-style paths
                path.normalize(prev)
            ),
            url,
            importsToResolve(utils.urlToRequest(url)),
            done
        );
    };
}

module.exports = webpackImporter;
