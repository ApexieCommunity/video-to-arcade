const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: "none",
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname)
    },
    resolve: {
        fallback: {
            "path-browserify": require.resolve("path-browserify"),
            "constants": require.resolve("constants-browserify"),
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "path": require.resolve("path-browserify"),
            "zlib": require.resolve("browserify-zlib"),
            "buffer": require.resolve("buffer/"),
            "assert": require.resolve("assert/"),
            "util": require.resolve("util/")
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname),
        },
        compress: true,
        port: 3000,
    }
}