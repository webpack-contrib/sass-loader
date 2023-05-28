import url from "url";
import path from "path";

import schema from "./options.json";
import {
  getSassImplementation,
  getSassOptions,
  getWebpackImporter,
  getModernWebpackImporter,
  getCompileFn,
  normalizeSourceMap,
  errorFactory,
} from "./utils";

/**
 * The sass-loader makes node-sass and dart-sass available to webpack modules.
 *
 * @this {object}
 * @param {string} content
 */
async function loader(content) {
  const options = this.getOptions(schema);
  const callback = this.async();

  let implementation;

  try {
    implementation = getSassImplementation(this, options.implementation);
  } catch (error) {
    callback(error);

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

  if (shouldUseWebpackImporter) {
    const isModernAPI = options.api === "modern";

    if (!isModernAPI) {
      const { includePaths } = sassOptions;

      sassOptions.importer.push(
        getWebpackImporter(this, implementation, includePaths)
      );
    } else {
      sassOptions.importers.push(
        getModernWebpackImporter(this, implementation)
      );
    }
  }

  let compile;

  try {
    compile = getCompileFn(implementation, options);
  } catch (error) {
    callback(error);
    return;
  }

  let result;

  try {
    result = await compile(sassOptions, options);
  } catch (error) {
    // There are situations when the `file`/`span.url` property do not exist
    // Modern API
    if (error.span && typeof error.span.url !== "undefined") {
      this.addDependency(url.fileURLToPath(error.span.url));
    }
    // Legacy API
    else if (typeof error.file !== "undefined") {
      // `node-sass` returns POSIX paths
      this.addDependency(path.normalize(error.file));
    }

    callback(errorFactory(error));

    return;
  }

  let map =
    // Modern API, then legacy API
    result.sourceMap
      ? result.sourceMap
      : result.map
      ? JSON.parse(result.map)
      : null;

  // Modify source paths only for webpack, otherwise we do nothing
  if (map && useSourceMap) {
    map = normalizeSourceMap(map, this.rootContext);
  }

  // Modern API
  if (typeof result.loadedUrls !== "undefined") {
    result.loadedUrls
      .filter((url) => url.protocol === "file:")
      .forEach((includedFile) => {
        const normalizedIncludedFile = url.fileURLToPath(includedFile);

        // Custom `importer` can return only `contents` so includedFile will be relative
        if (path.isAbsolute(normalizedIncludedFile)) {
          this.addDependency(normalizedIncludedFile);
        }
      });
  }
  // Legacy API
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
