/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import named from 'vinyl-named';
import webpack from 'webpack';
import gulpWebpack from 'webpack-stream';
import through2 from 'through2';
import { PATHS } from './constants';

const $ = gulpLoadPlugins();

const {
  root: rootPath,
  scripts: {
    src: srcPath,
    tmp: tmpPath,
    dest: destPath,
  },
} = PATHS;

const tmpWebpack = BS => () => gulp.src(srcPath)
  .pipe(named())
  .pipe(gulpWebpack({}, webpack))
  .pipe(gulp.dest(tmpPath))
  .pipe(BS.stream({ once: true }));

const webpackTask = () => gulp.src(srcPath)
  .pipe(named())
  .pipe(gulpWebpack({}, webpack))
  .pipe(through2.obj(function (file, enc, next) {
    // Dont pipe through any source map files as it will be handled by gulp-sourcemaps
    if (!/\.map$/.test(file.path)) {
      this.push(file);
    }

    next();
  }))
  // .pipe($.size({ title: 'scripts', showFiles: true }))
  .pipe($.rev())
  .pipe(gulp.dest(destPath))
  .pipe($.rev.manifest({
    base: process.cwd(),
    merge: true,
  }))
  .pipe(gulp.dest(rootPath));

export {
  tmpWebpack,
  webpack: webpackTask,
};
