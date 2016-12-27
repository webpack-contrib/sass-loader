"use strict";

const path = require("path");
const sassLoader = require.resolve("../../lib/loader");

module.exports = {
    entry: path.resolve(__dirname, "./entry.js"),
    output: {
        path: path.resolve(__dirname, "../output"),
        filename: "bundle.sourcemap.js"
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader", options: {
                        sourceMap: true
                    } },
                    { loader: sassLoader, options: {
                        sourceMap: true
                    } }
                ]
            }
        ]
    }
};
