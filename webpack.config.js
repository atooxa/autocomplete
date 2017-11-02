const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    'static/bundle': './app/client/index.js'
  },
  output: {
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  autoprefixer({
                    browsers:['ie >= 8', 'last 5 version']
                  })
                ],
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader'
            }
          ]
        }),
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  devtool : 'cheap-module-source-map',
  plugins: [
    new ExtractTextPlugin('./static/styles.css'),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ],
  //watch: true
};
