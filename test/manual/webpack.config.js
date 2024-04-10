module.exports = {
  devtool: "source-map",
  mode: "development",
  output: {
    publicPath: "/dist/",
  },
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: require.resolve("../../dist/cjs.js"),
            options: {
              api: process.env.SASS_API
                ? process.env.SASS_API
                : "modern-compiler",
              implementation: process.env.SASS_IMPLEMENTATION
                ? // eslint-disable-next-line global-require, import/no-dynamic-require
                  require(process.env.SASS_IMPLEMENTATION)
                : // eslint-disable-next-line global-require
                  require("sass"),
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    static: __dirname,
  },
};
