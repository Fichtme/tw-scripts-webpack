const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: glob.sync('./assets/scripts/**.js').reduce(function(obj, el){
        obj[path.parse(el).name] = el;
        return obj
    },{}),
    // when babel-loader is enabled (probably) async/await causes:
    // Uncaught ReferenceError: regeneratorRuntime is not defined
    module: {
        rules: [
            {
                test: /\.js$/i,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new WebpackBuildNotifierPlugin({
            title: "Global JS",
        }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }),
    ],
    output: {
        filename: 'js/[name].bundle.js',
        path: path.resolve(__dirname, 'public', 'build'),
        publicPath: "/build/",
    },
};
