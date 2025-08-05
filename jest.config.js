const isNodeSassSupported = require("./test/helpers/is-node-sass-supported");

module.exports = {
  testEnvironment: "jest-environment-node-single-context",

  snapshotResolver:
    "<rootDir>/test/helpers/skip-node-sass-snapshot-resolver.js",
  moduleNameMapper: isNodeSassSupported()
    ? {}
    : {
        // For Node.js@22, because `node-sass` doesn't support it
        "^node-sass$": "sass",
      },
};
