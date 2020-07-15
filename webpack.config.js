const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const baseConfig = require('@instructure/ui-webpack-config');
module.exports = {
  ...baseConfig,
  mode: 'production',
  entry: './app/index.js',
  devtool: 'source-map',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: './app/index_webpack.html',
      filename: './index.html',
    }),
  ],
};
