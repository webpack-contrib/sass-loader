'use strict';

var path = require('path');

var pathToSassLoader = path.resolve(__dirname, '../../index.js');

module.exports = {
    entry: [
        path.resolve(__dirname, '../scss/imports.scss'),
        path.resolve(__dirname, '../scss/import-include-paths.scss')
    ],
    output: {
        path: path.resolve(__dirname, '../output'),
        filename: 'bundle.watch.js'
    },
    watch: true,
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: 'css-loader!' + pathToSassLoader + '?includePaths[]=' + encodeURIComponent(path.resolve(__dirname, '../scss/from-include-path'))
            }
        ]
    }
};
