const [nodeMajor] = process.versions.node.split(".").map(Number);

module.exports = {
  testEnvironment: "jest-environment-node-single-context",
  moduleNameMapper:
    nodeMajor > 20
      ? {
          // For Node.js@22, because `node-sass` doesn't support it
          "^node-sass$": "sass",
        }
      : {},
};
