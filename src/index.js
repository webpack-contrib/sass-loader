import path from "path";

import schema from "./options.json";
import {
  getSassImplementation,
  getSassOptions,
  getWebpackImporter,
  getRenderFunctionFromSassImplementation,
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
    typeof options.sourceMap === "undefined"
      ? this.sourceMap
      : options.sourceMap;

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
    const { includePaths } = sassOptions;

    sassOptions.importer.push(
      getWebpackImporter(this, implementation, includePaths)
    );
  }

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

    result.stats.includedFiles.forEach((includedFile) => {
      const normalizedIncludedFile = path.normalize(includedFile);

      // Custom `importer` can return only `contents` so includedFile will be relative
      if (path.isAbsolute(normalizedIncludedFile)) {
        this.addDependency(normalizedIncludedFile);
      }
    });

    let map = result.map ? JSON.parse(result.map) : null;

    if (map) {
      if (useSourceMap === "external" && !sassOptions.sourceMapEmbed) {
        const outFile =
          process.platform !== "win32"
            ? sassOptions.resolvedOutFile
            : sassOptions.resolvedOutFile.split(path.sep).join("/");

        this.emitFile(`${outFile}.map`, JSON.stringify(map));

        map = null;
      } else if (useSourceMap) {
        map = normalizeSourceMap(map, this.rootContext);
      }
    }

    callback(null, result.css.toString(), map);
  });
}

export default loader;
