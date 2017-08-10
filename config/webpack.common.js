'use strict';
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const helpers = require('./helpers');

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
				loader: ExtractTextPlugin.extract({loader: 'css-loader?sourceMap'}),
				include: [helpers.root('src')]
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)\w*/,
				loader: 'file-loader?publicPath=/static/res/&outputPath=font/'
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
};
