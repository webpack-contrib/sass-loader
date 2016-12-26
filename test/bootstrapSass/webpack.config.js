"use strict";

const path = require("path");

const pathToSassLoader = path.resolve(__dirname, "../../index.js");

module.exports = {
    entry: path.resolve(__dirname, "../scss/bootstrap-sass.scss"),
    output: {
        path: path.resolve(__dirname, "../output"),
        filename: "bundle.bootstrap-sass.js"
    },
    devtool: "inline-source-map",
    module: {
        loaders: [
            {
                test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
                loader: "file"
            },
            {
                test: /\.scss$/,
                loader: "style-loader!css-loader!" + pathToSassLoader
            }
        ]
    }
};
