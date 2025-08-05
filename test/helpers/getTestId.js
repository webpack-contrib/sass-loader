/**
 * @param {string} testId test ID
 * @param {"sass" | "scss"} syntax a sass syntax
 * @returns {string} resolved test ID
 */
function getTestId(testId, syntax) {
  return `${syntax}/${testId}.${syntax}`;
}

export default getTestId;
