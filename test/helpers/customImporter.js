function customImporter(url, prev) {
  expect(url).toBe('import-with-custom-logic');
  expect(prev).toMatch(/(sass|scss)[/\\]custom-importer\.(scss|sass)/);
  expect(this.options).toBeDefined();

  return customImporter.returnValue;
}

customImporter.returnValue = {
  contents: '.custom-imported {}',
};

export default customImporter;
