/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import {
  HTMLMINIFIER,
  PATHS,
} from './constants';

const $ = gulpLoadPlugins({
  rename: {
    'gulp-rev-replace': 'replace',
  },
});

const {
  styles: {
    clean: cleanPath,
  },
  html: {
    src: srcPath,
    dest: destPath,
  },
  manifest: manifestPath,
  assets: searchPath,
} = PATHS;

const cleanCondition = (file) => {
  const basename = path.basename(file.path);

  if (cleanPath.includes(basename)) {
    return true;
  }

  return false;
};

const html = () => gulp.src(srcPath)
  .pipe($.useref({
    searchPath,
  }))
  .pipe($.replace({
    manifest: gulp.src(manifestPath),
  }))
  .pipe($.inlineSource({
    rootpath: destPath,
    compress: false,
  }))
  .pipe($.if(cleanCondition, $.cleanCss()))
  .pipe($.if('*.html', $.htmlmin(HTMLMINIFIER)))
  .pipe($.if('*.html', $.size({ title: 'html', showFiles: true })))
  .pipe(gulp.dest(destPath));

export default html;
