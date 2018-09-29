import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import rimraf from 'rimraf';
import { PATHS } from './constants';

const $ = gulpLoadPlugins();

const {
  copy: copyPath,
  clean: cleanPath,
} = PATHS;

const copy = () => gulp.src(copyPath)
  .pipe(gulp.dest('dist'))
  .pipe($.size({ title: 'copy' }));

function clean(done) {
  rimraf(`{${cleanPath.join(',')}}`, done);
}

const cleanCache = done => $.cache.clearAll(done);

export {
  copy,
  clean,
  cleanCache,
};
