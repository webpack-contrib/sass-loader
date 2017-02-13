"use strict";

const path = require("path");
const sassLoader = require.resolve("../../lib/loader");

module.exports = {
    entry: path.resolve(__dirname, "..", "scss", "imports.scss"),
    output: {
        filename: "bundle.js"
    },
    devtool: "source-map",
    module: {
        rules: [{
            test: /\.scss$/,
            use: [{
                loader: "style-loader"
            }, {
                loader: "css-loader", options: {
                    sourceMap: true
                }
            }, {
                loader: sassLoader, options: {
                    sourceMap: true
                }
            }]
        }]
    }
};
