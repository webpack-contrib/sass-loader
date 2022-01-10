import url from "url";
import path from "path";

import schema from "./options.json";
import {
  getSassImplementation,
  getSassOptions,
  getWebpackImporter,
  getCompileFn,
  normalizeSourceMap,
} from "./utils";
import SassError from "./SassError";

/**
 * The sass-loader makes node-sass and dart-sass available to webpack modules.
 *
 * @this {object}
 * @param {string} content
 */
async function loader(content) {
  const options = this.getOptions(schema);
  const callback = this.async();
  const implementation = getSassImplementation(this, options.implementation);

  if (!implementation) {
    callback();

    return;
  }

  const useSourceMap =
    typeof options.sourceMap === "boolean" ? options.sourceMap : this.sourceMap;
  const sassOptions = await getSassOptions(
    this,
    options,
    content,
    implementation,
    useSourceMap
  );
  const shouldUseWebpackImporter =
    typeof options.webpackImporter === "boolean"
      ? options.webpackImporter
      : true;

  const isModernAPI = options.api === "modern";

  if (shouldUseWebpackImporter && !isModernAPI) {
    const { includePaths } = sassOptions;

    sassOptions.importer.push(
      getWebpackImporter(this, implementation, includePaths)
    );
  }

  const compile = getCompileFn(implementation, options);

  let result;

  try {
    result = await compile(sassOptions, options);
  } catch (error) {
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

  // Modern API
  if (typeof result.loadedUrls !== "undefined") {
    result.loadedUrls.forEach((includedFile) => {
      const normalizedIncludedFile = url.fileURLToPath(includedFile);

      // Custom `importer` can return only `contents` so includedFile will be relative
      if (path.isAbsolute(normalizedIncludedFile)) {
        this.addDependency(normalizedIncludedFile);
      }
    });
  }
  // Old API
  else if (
    typeof result.stats !== "undefined" &&
    typeof result.stats.includedFiles !== "undefined"
  ) {
    result.stats.includedFiles.forEach((includedFile) => {
      const normalizedIncludedFile = path.normalize(includedFile);

      // Custom `importer` can return only `contents` so includedFile will be relative
      if (path.isAbsolute(normalizedIncludedFile)) {
        this.addDependency(normalizedIncludedFile);
      }
    });
  }

  callback(null, result.css.toString(), map);
}

export default loader;
