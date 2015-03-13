'use strict';

var path = require('path');

var pathToSassLoader = path.resolve(__dirname, '../../index.js');

module.exports = {
    entry: path.resolve(__dirname, '../sourceMap/entry.js'),
    output: {
        path: path.resolve(__dirname, '../output'),
        filename: 'bundle.watch.js'
    },
    watch: true,
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: 'css-loader!' + pathToSassLoader
            }
        ]
    }
};
