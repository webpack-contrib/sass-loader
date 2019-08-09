'use strict';

const path = require('path');

const sassLoader = require.resolve('../../src/cjs');

module.exports = {
  entry: path.resolve(__dirname, './entry.js'),
  output: {
    path: path.resolve(__dirname, '../output'),
    filename: 'bundle.hmr.js',
  },
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
          },
        ],
      },
    ],
  },
};
