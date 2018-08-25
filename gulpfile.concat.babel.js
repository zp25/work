import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import {
  PATHS,
} from './constants';

const $ = gulpLoadPlugins();

const {
  root: rootPath,
  scripts: {
    concat: files,
    tmp: tmpPath,
    dest: destPath,
  },
} = PATHS;

// Scripts
const tmpConcat = BS => (done) => {
  if (files.length === 0) {
    done();
    return;
  }

  return gulp.src(files)
    .pipe($.newer(tmpPath))
    .pipe($.sourcemaps.init())
      .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(tmpPath))
    .pipe(BS.stream({ once: true }));
}

const concat = (done) => {
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
      .pipe($.size({ title: 'concat' }))
      .pipe($.rev())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(destPath))
    .pipe($.rev.manifest({
      base: process.cwd(),
      merge: true,
    }))
    .pipe(gulp.dest(rootPath));
}

export { tmpConcat, concat };
