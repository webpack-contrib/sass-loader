'use strict';

var path = require('path');

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
                loaders: ['style', 'css-loader?sourceMap', pathToSassLoader + '?sourceMap']
            }
        ]
    }
};
