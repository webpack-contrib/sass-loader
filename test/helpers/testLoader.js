function testLoader(content, sourceMap) {
  const result = { css: content };

  if (sourceMap) {
    result.sourceMap = sourceMap;
  }

  return `module.exports = ${JSON.stringify(result)}`;
}

module.exports = testLoader;
