const gulp = require('gulp');
const webpack = require('webpack');
const _ = require('lodash');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const productionWebpackConfig = require('./webpack.config');

gulp.task('build', (cb) => {
  webpack(productionWebpackConfig, (err, stats) => {
    console.log(stats.toString());

    cb();
  });
});

gulp.task('startServer', () => {
  require('./app/server')
});

gulp.task('start', ['build', 'startServer']);
