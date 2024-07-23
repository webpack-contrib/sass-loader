const isNodeSassSupported = require("./is-node-sass-supported");

module.exports = {
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    `${testPath.replace(
      "test",
      "test/__snapshots__",
    )}${isNodeSassSupported() ? "" : ".no-node-sass"}${snapshotExtension}`,

  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath
      .replace(/test[/\\]__snapshots__/, "test")
      .replace(".no-node-sass", "")
      .slice(0, -snapshotExtension.length),

  testPathForConsistencyCheck: "some/test/example.test.js",
};
