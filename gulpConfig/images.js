/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import { PATHS } from './constants';

const $ = gulpLoadPlugins();

const {
  images: {
    src: srcPath,
    tmp: tmpPath,
    dest: destPath,
  },
} = PATHS;

const makeHashKey = entry => file => [file.contents.toString('utf8'), entry].join('');

const images = () => gulp.src(srcPath)
  .pipe($.cache($.imagemin({
    progressive: true,
    interlaced: true,
    multipass: true,
  }), {
    key: makeHashKey('images'),
  }))
  .pipe(gulp.dest(destPath))
  .pipe($.size({ title: 'images' }));

const tmpWebp = BS => () => gulp.src(srcPath)
  .pipe($.cache($.webp({ quality: 75 }), { key: makeHashKey('webp') }))
  .pipe(gulp.dest(tmpPath))
  .pipe(BS.stream({ once: true }));

const webp = () => gulp.src(srcPath)
  .pipe($.cache($.webp({ quality: 75 }), { key: makeHashKey('webp') }))
  .pipe(gulp.dest(destPath))
  .pipe($.size({ title: 'webp' }));

export {
  images,
  tmpWebp,
  webp,
};
