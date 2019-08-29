module.exports = {
  devtool: 'source-map',
  mode: 'development',
  output: {
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: require.resolve('../../dist/cjs.js'),
            options: {
              implementation: process.env.SASS_IMPLEMENTATION
                ? // eslint-disable-next-line global-require, import/no-dynamic-require
                  require(process.env.SASS_IMPLEMENTATION)
                : // eslint-disable-next-line global-require
                  require('sass'),
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    hot: true,
    contentBase: __dirname,
    overlay: true,
  },
};
