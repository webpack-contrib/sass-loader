'use strict';

var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var pathToSassLoader = path.resolve(__dirname, '../../index.js');

module.exports = {
    entry: path.resolve(__dirname, './entry.js'),
    output: {
        path: path.resolve(__dirname, '../output'),
        filename: 'bundle.sourcemap.js'
    },
    devtool: 'inline-source-map',
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(
                    'css-loader?sourceMap!' +
                    pathToSassLoader + '?sourceMap'
                )
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('styles.css')
    ]
};
