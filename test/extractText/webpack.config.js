"use strict";

const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const sassLoader = require.resolve("../../lib/loader");

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = {
    entry: require.resolve("../scss/language.scss"),
    output: {
        path: path.resolve(__dirname, "../output"),
        filename: "bundle.extractText.js"
    },
    module: {
        rules: [{
            test: /\.scss$/,
            loader: extractSass.extract({
                loader: [{
                    loader: "css-loader"
                }, {
                    loader: sassLoader
                }],
                fallbackLoader: "style-loader"
            })
        }]
    },
    plugins: [
        extractSass
    ]
};
