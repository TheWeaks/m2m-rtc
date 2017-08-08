var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var helpers = require('./helpers')

module.exports = {
  entry: {
    'app': './src/main.js'
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({ loader: 'css-loader?sourceMap' }),
        include: [helpers.root('src')]
      }
    ]

  },

  plugins: [

    new webpack.optimize.CommonsChunkPlugin({
      name: ['app']
    }),

    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
}
