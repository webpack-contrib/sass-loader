module.exports = {
    entry: "./src/entry",
    output: "test.js",
    resolveLoader: {
      modulesDirectories: ["web_loaders", "web_modules", "node_loaders", "node_modules"],
      extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
      packageMains: ["webpackLoader", "webLoader", "loader", "main"]
    }
};
