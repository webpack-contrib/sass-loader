module.exports = {
  testEnvironment: "jest-environment-node-single-context",
  moduleNameMapper: {
    // For Node.js@22, because `node-sass` doesn't support it
    "^node-sass$": "sass",
  },
};
