function getTestId(testId, syntax) {
  return `${syntax}/${testId}.${syntax}`;
}

export default getTestId;
