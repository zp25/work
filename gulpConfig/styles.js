/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import {
  SRC,
  OUTPUT,
  TEMP,
} from './constants';

const $ = gulpLoadPlugins();
const pwd = process.cwd();

// Lint
const stylelint = () => (
  gulp.src(path.join(SRC, '**/*.{scss,css}'))
    .pipe($.stylelint({
      failAfterError: false,
      reporters: [
        {
          formatter: 'verbose',
          console: true,
        },
      ],
    }))
);

const tmpSass = BS => (src, opts = {}) => () => {
  const {
    includePaths = [],
  } = opts;

  const processors = [
    autoprefixer(),
  ];

  return gulp.src(src, { base: SRC })
    .pipe($.newer(TEMP))
    .pipe($.sourcemaps.init())
    // sourcemap start
    .pipe(
      $.sass({
        includePaths,
        precision: 10,
      })
        .on('error', $.sass.logError),
    )
    .pipe($.postcss(processors))
    // sourcemap end
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(TEMP))
    .pipe(BS.stream({ once: true }));
};

function sass(src, opts = {}) {
  const {
    includePaths = [],
  } = opts;

  const processors = [
    autoprefixer(),
    cssnano(),
  ];

  const task = () => gulp.src(src, { base: SRC })
    .pipe($.sourcemaps.init())
    // sourcemap start
    .pipe(
      $.sass({
        includePaths,
        precision: 10,
      })
        .on('error', $.sass.logError),
    )
    .pipe($.postcss(processors))
    .pipe($.size({ title: 'styles', showFiles: true }))
    .pipe($.rev())
    // sourcemap end
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(OUTPUT))
    .pipe($.rev.manifest({
      base: pwd,
      merge: true,
    }))
    .pipe(gulp.dest(pwd));

  task.displayName = 'sass';

  return task;
}

export {
  stylelint,
  tmpSass,
  sass,
};
