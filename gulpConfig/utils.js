/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import rimraf from 'rimraf';
import {
  SRC,
  OUTPUT,
  TEMP,
} from './constants';

const $ = gulpLoadPlugins();

// 复制资源
function copy(src = []) {
  if (!Array.isArray(src)) {
    throw new TypeError('invalid path');
  }

  const basePaths = [
    path.join(SRC, '*'),
    `!${path.join(SRC, '*.html')}`,
  ];

  const task = () => (
    gulp.src(basePaths.concat(src), { base: 'app' })
      .pipe(gulp.dest(OUTPUT))
      .pipe($.size({ title: 'copy' }))
  );

  task.displayName = 'copy';

  return task;
}

// 删除临时目录，删除目标目录中内容
function clean(done) {
  const paths = [
    TEMP,
    path.join(OUTPUT, '*'),
  ];

  rimraf(`{${paths.join(',')}}`, done);
}

// 清缓存
const cleanCache = done => $.cache.clearAll(done);

export {
  copy,
  clean,
  cleanCache,
};
