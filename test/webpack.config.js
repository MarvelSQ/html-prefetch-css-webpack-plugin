const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

const PrefetchCssWebpackPlugin = require('../index')
module.exports = {
  mode: 'development',
  entry: {
    index: path.resolve(__dirname, './index.js'),
    second: path.resolve(__dirname, './second.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: '[name].bundle.js',
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /css$/,
        loaders: [MiniCSSExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      excludeChunks: ['second'],
      template: path.resolve(__dirname, './index.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'second.html',
      excludeChunks: ['index'],
      template: path.resolve(__dirname, './index.html')
    }),
    new PrefetchCssWebpackPlugin(),
    new MiniCSSExtractPlugin({
      filename: '[name].css'
    })
  ]
}
