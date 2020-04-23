function customImporter(url, prev, done) {
  expect(url).toBe('import-with-custom-logic');
  expect(prev).toMatch(/(sass|scss)[/\\]custom-importer\.(scss|sass)/);
  expect(this.options).toBeDefined();

  if (done) {
    done(customImporter.returnValue);

    return;
  }

  // eslint-disable-next-line consistent-return
  return customImporter.returnValue;
}

customImporter.returnValue = {
  contents: '.custom-imported {}',
};

export default customImporter;
