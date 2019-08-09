'use strict';

const path = require('path');

const sassLoader = require.resolve('../../src/cjs');

module.exports = {
  entry: path.resolve(__dirname, '../scss/bootstrap-sass.scss'),
  output: {
    path: path.resolve(__dirname, '../output'),
    filename: 'bundle.bootstrap-sass.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: sassLoader,
            options: {
              includePaths: [path.resolve(__dirname, '../scss/includePath')],
            },
          },
        ],
      },
      {
        test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
};
