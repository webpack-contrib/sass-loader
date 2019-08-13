'use strict';

function customImporter(path, prev) {
  expect(path).toBe('import-with-custom-logic');
  expect(prev).toMatch(/(sass|scss)[/\\]custom-importer\.(scss|sass)/);
  expect(this.options).toBeDefined();

  return customImporter.returnValue;
}

customImporter.returnValue = {
  contents: '.custom-imported {}',
};

module.exports = customImporter;
