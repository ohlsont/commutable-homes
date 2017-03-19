const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FlowStatusWebpackPlugin = require('flow-status-webpack-plugin')
const GhPagesWebpackPlugin = require('gh-pages-webpack-plugin')
const path = require('path')

const d = __dirname
const outputPath = `${d}/build/`
const isProduction = true // !!process.env.CIRCLE_BRANCH

const test = /\.js[x]?$/
const exclude = /(node_modules|build)/

const urlLoader = {
    test: /\.(png|jpg|jpeg|gif|eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
    use: {
        loader: 'url-loader',
        options: {
            limit: 10000,
        }
    }
}

const cssLoader = {
    test: /\.css$/,
    exclude,
    use: [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                modules: true,
                localIdentName: '[path][name]---[local]---[hash:base64:5]',
            }
        },
        'postcss-loader'
    ],
}

const devLoaders = [
    {
        test,
        exclude,
        use: [
            'react-hot-loader',
            {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true
                }
            }
        ],
    },
    {
        test,
        exclude,
        enforce: 'pre',
        use: {
            loader: 'eslint-loader',
            options: {
                cache: true
            }
        },
    },
    cssLoader,
    urlLoader
]

const prodLoaders = [
    { test, exclude, use: 'babel-loader' },
    cssLoader,
    { test: /\.less$/, exclude: /\.useable\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
    { test: /\.useable\.less$/,
        use: [
            {
                loader: 'style-loader',
                options: {
                    useable: true
                }
            },
            'less-loader'
        ]
    },
    {
        test: /\.scss$/,
        use: [
            'style-loader',
            {
                loader: 'css-loader',
                options: {
                    modules: true,
                    localIdentName: '[path][name]---[local]---[hash:base64:5]',
                    importLoaders: 1
                }
            },
            'resolve-url-loader',
            'sass-loader'
        ]
    },
    urlLoader
]

const rules = isProduction ? prodLoaders : devLoaders
function isExternal(module) {
    const userRequest = module.userRequest

    if (typeof userRequest !== 'string') {
        return false
    }

    return userRequest.indexOf('bower_components') >= 0 ||
        userRequest.indexOf('node_modules') >= 0 ||
        userRequest.indexOf('libraries') >= 0
}

const plugins = [
    isProduction ? null : new webpack.HotModuleReplacementPlugin(),
    isProduction ? null : new webpack.NoEmitOnErrorsPlugin(),
    isProduction ? null : new FlowStatusWebpackPlugin({ failOnError: true }),
    isProduction ? new ExtractTextPlugin({ filename: 'style.css', allChunks: true }) : null,
    isProduction ? new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('production'),
            CIRCLE_BRANCH: JSON.stringify(process.env.CIRCLE_BRANCH)
        }
    }) : null,
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendors',
        filename: 'vendor.bundle.js',
        minChunks: isExternal
    }),
    isProduction ? new webpack.optimize.UglifyJsPlugin({ output: { comments: false } }) : null,
    isProduction ? new webpack.optimize.AggressiveMergingPlugin() : null,
    isProduction ? new GhPagesWebpackPlugin({
        path: outputPath,
        options: {
            message: 'Update Home Page',
        }
    }) : null,
].filter(e => e)

const APP_PATH = './src'
const config = {
    devtool: isProduction ? 'source-map' : 'eval',
    entry: [
        isProduction ? null : 'webpack/hot/only-dev-server',
        APP_PATH,
        'whatwg-fetch'
    ].filter(e => e),

    output: {
        path: outputPath,
        filename: 'app.js',
        publicPath: '/'
    },
    plugins,
    module: {
        noParse: /node_modules\/mapbox-gl\/dist\/mapbox-gl.js/,
        rules
    },
    resolve: {
        alias: {
            '~': path.resolve(d, 'src/'),
            'react/lib/ReactMount': 'react-dom/lib/ReactMount'
        },
        extensions: ['.js', '.jsx', '.css'],
        modules: ['node_modules']
    }
}

if (!isProduction) {
    config.devServer = {
        historyApiFallback: true,
        contentBase: './build',
        hot: true,
        stats: {
            colors: true,
            chunks: false
        }
    }
}

module.exports = config