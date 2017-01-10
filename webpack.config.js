const path = require('path')
const webpack = require('webpack')

module.exports = {
    devtool: 'cheap-module-eval-source-map',
    entry: [
        'webpack-hot-middleware/client',
        './src/index.jsx'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        loaders: [{
            test: [/\.js$/, /\.jsx$/],
            loaders: ['react-hot', 'babel'],
            include: path.join(__dirname, 'src')
        }]
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.css'],
    },
}
