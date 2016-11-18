import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const PATHS = {
  scripts: {
    src: [
      'app/scripts/**/*.js',
      '!app/scripts/dev.js',
      '!app/scripts/templates.min.js',
    ],
    tmp: '.tmp/scripts',
    dest: 'dist/scripts',
  },
};

// Scripts
const tmpConcat = BS => () => {
  return gulp.src(PATHS.scripts.src)
    .pipe($.newer(PATHS.scripts.tmp))
    .pipe($.sourcemaps.init())
      .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(PATHS.scripts.tmp))
    .pipe(BS.stream({ once: true }));
};

const concat = () => {
  return gulp.src(PATHS.scripts.src)
    .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({
        // preserveComments: 'license',
        compress: {
          global_defs: {
            'DEV': false,
          },
        },
      }))
      .pipe($.size({ title: 'scripts' }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.scripts.dest));
};

export { tmpConcat, concat };
