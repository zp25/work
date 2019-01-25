/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import {
  SRC,
  OUTPUT,
  TEMP,
} from './constants';

const $ = gulpLoadPlugins();

const makeHashKey = entry => file => [file.contents.toString('utf8'), entry].join('');

function images(src) {
  const task = () => gulp.src(src, { base: SRC })
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      multipass: true,
    }), {
      key: makeHashKey('images'),
    }))
    .pipe(gulp.dest(OUTPUT))
    .pipe($.size({ title: 'images' }));

  task.displayName = 'images';

  return task;
}

const tmpWebp = BS => src => () => gulp.src(src, { base: SRC })
  .pipe($.cache($.webp({ quality: 75 }), { key: makeHashKey('webp') }))
  .pipe(gulp.dest(TEMP))
  .pipe(BS.stream({ once: true }));

function webp(src) {
  const task = () => gulp.src(src, { base: SRC })
    .pipe($.cache($.webp({ quality: 75 }), { key: makeHashKey('webp') }))
    .pipe(gulp.dest(OUTPUT))
    .pipe($.size({ title: 'webp' }));

  task.displayName = 'webp';

  return task;
}

export {
  images,
  tmpWebp,
  webp,
};
