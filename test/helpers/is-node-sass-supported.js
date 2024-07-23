const [nodeMajor] = process.versions.node.split(".").map(Number);

function isNodeSassSupported() {
  return nodeMajor <= 20;
}

module.exports = isNodeSassSupported;
