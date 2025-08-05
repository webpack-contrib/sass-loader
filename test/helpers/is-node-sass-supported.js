const [nodeMajor] = process.versions.node.split(".").map(Number);

/**
 * @returns {boolean} true when node-sass supported, otherwise false
 */
function isNodeSassSupported() {
  return nodeMajor <= 20;
}

module.exports = isNodeSassSupported;
