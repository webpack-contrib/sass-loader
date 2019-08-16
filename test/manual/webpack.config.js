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
              // eslint-disable-next-line global-require
              implementation: require('sass'),
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
  },
};
