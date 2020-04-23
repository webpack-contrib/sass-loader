/**
 * @param {Function|Array<Function>} importer
 * @param {string} resourcePath
 * @returns {Array<Function>}
 */
function proxyCustomImporters(importer, resourcePath) {
  return [].concat(importer).map(
    // eslint-disable-next-line no-shadow
    (importer) =>
      function customImporter() {
        return importer.apply(
          this,
          // eslint-disable-next-line prefer-rest-params
          Array.from(arguments).map((arg, i) =>
            i === 1 && arg === 'stdin' ? resourcePath : arg
          )
        );
      }
  );
}

export default proxyCustomImporters;
