var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        test: path.join(__dirname, "src/entry.js")
    },
    output: {
        path: __dirname,
        publicPath: "/",
        filename: "[name].js",
        sourceMapFilename: "[file].map"
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};
