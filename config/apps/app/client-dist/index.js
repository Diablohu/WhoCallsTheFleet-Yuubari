// const fs = require('fs-extra')
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")

const {
    _app: pathApp,
    _appOutput: pathOutput,
    _appName: pathNameSub,
    ...dirs
} = require('../../../directories.js')
const publicPath = `/${pathNameSub}/`

const pluginCopyImages = require('../base/plugin-copy-images')

const config = require('../base/factory')({
    isExtractTextPlugin: true
})

const isAnalyze = process.env.WEBPACK_ANALYZER || false

module.exports = (async () => Object.assign({}, config, {

    analyzer: isAnalyze,

    entry: {
        ...config.entry,
        commons: [
            'react',
            'react-dom',

            'redux',
            'redux-thunk',
            'react-redux',

            'react-router',
            'react-router-redux',

            'react-transition-group',

            // 'localforage',
            'lz-string',
            'metas',
            'classnames',
            'js-cookie',

            'kckit',
        ]
    },

    output: {
        // filename: `[name].[chunkhash].js`,
        // chunkFilename: `chunk.[name].[chunkhash].js`,
        filename: `core.[chunkhash].js`,
        chunkFilename: `chunk.[chunkhash].js`,
        path: pathOutput,
        publicPath: publicPath // TODO 改成静态第三方URL用于CDN部署 http://localhost:3000/
    },

    plugins: [
        'default',
        {
            'pwa': {
                outputPath: path.resolve(pathOutput, '../'),
                outputFilename: `service-worker.${pathNameSub}.js`,
                outputFilenameHash: false,
                // customServiceWorkerPath: path.normalize(appPath + '/src/client/custom-service-worker.js'),
                globPattern: `/${pathNameSub}/**/*`,
                globOptions: {
                    ignore: [
                        '/**/_*/',
                        '/**/_*/**/*',
                        '/**/chunk.database.*'
                    ]
                },
                // appendUrls: getUrlsFromRouter()
                appendUrls: []
            }
        },
        [
            ...config.plugins,
            new ExtractTextPlugin('[name].[chunkhash].css'),
            new webpack.DefinePlugin({
                '__ELECTRON__': false,
                '__PUBLIC__': JSON.stringify(publicPath),
            }),
            // new webpack.optimize.CommonsChunkPlugin({
            //     children: true,
            //     deepChildren: true,
            // }),
            new webpack.optimize.CommonsChunkPlugin({
                names: [
                    'commons',
                    'critical',
                ],
                filename: 'core.[chunkhash].js'
            }),
            // new webpack.optimize.CommonsChunkPlugin({
            //     name: "commons",
            //     filename: '[name].[chunkhash].js',
            //     minChunks: 3
            // }),
            ...(isAnalyze ? [] : await pluginCopyImages()),
        ]
    ],

})
)()