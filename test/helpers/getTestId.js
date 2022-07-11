function getTestId(testId, syntax) {
  return `${syntax}/${testId}.${syntax}`;
}

module.exports = getTestId;
