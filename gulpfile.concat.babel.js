import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import {
  PATHS,
} from './constants';

const $ = gulpLoadPlugins();

// Scripts
const tmpConcat = BS => (done) => {
  const files = PATHS.scripts.concat;

  if (files.length === 0) {
    done();
    return;
  }

  return gulp.src(files)
    .pipe($.newer(PATHS.scripts.tmp))
    .pipe($.sourcemaps.init())
      .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(PATHS.scripts.tmp))
    .pipe(BS.stream({ once: true }));
}

const concat = (done) => {
  const files = PATHS.scripts.concat;

  if (files.length === 0) {
    done();
    return;
  }

  return gulp.src(files)
    .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.concat({
        path: 'concat.js',
        cwd: '',
      }))
      .pipe($.uglify({
        // preserveComments: 'license',
        compress: {
          global_defs: {
            'DEV': false,
          },
        },
      }))
      .pipe($.size({ title: 'scripts' }))
      .pipe($.rev())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.scripts.dest))
    .pipe($.rev.manifest({
      base: process.cwd(),
      merge: true,
    }))
    .pipe(gulp.dest(PATHS.root));
}

export { tmpConcat, concat };
