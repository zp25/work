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

const basePaths = [
  path.join(SRC, '**/*.{scss,css}'),
];

// Lint
const stylelint = (src = []) => {
  if (!Array.isArray(src)) {
    throw new TypeError('invalid path');
  }

  const task = () => gulp.src(basePaths.concat(src))
    .pipe($.stylelint({
      failAfterError: false,
      reporters: [
        {
          formatter: 'verbose',
          console: true,
        },
      ],
    }));

  task.displayName = 'stylelint';

  return task;
};

const tmpSass = BS => (opts = {}) => () => {
  const {
    src = [],
    base = SRC,
    includePaths = [],
  } = opts;

  if (!Array.isArray(src)) {
    throw new TypeError('invalid path');
  }

  const processors = [
    autoprefixer(),
  ];

  return gulp.src(basePaths.concat(src), { base })
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

function sass(opts = {}) {
  const {
    src = [],
    base = SRC,
    includePaths = [],
  } = opts;

  if (!Array.isArray(src)) {
    throw new TypeError('invalid path');
  }

  const processors = [
    autoprefixer(),
    cssnano(),
  ];

  const task = () => gulp.src(basePaths.concat(src), { base })
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
