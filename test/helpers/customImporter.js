/* global expect */

// eslint-disable-next-line jsdoc/no-restricted-syntax
/**
 * @param {string} url URL
 * @param {string} prev prev URL
 * @param {undefined | ((value: any) => void)} done done callback
 * @returns {any} result
 */
function customImporter(url, prev, done) {
  expect(url).toBe("import-with-custom-logic");
  expect(prev).toMatch(/(sass|scss)[/\\]custom-importer\.(scss|sass)/);
  expect(this.options).toBeDefined();

  if (done) {
    done(customImporter.returnValue);

    return;
  }

  return customImporter.returnValue;
}

customImporter.returnValue = {
  contents: ".custom-imported {}",
};

export default customImporter;
