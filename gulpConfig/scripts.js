/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import log from 'fancy-log';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import merge from 'merge-stream';
import {
  SRC,
  OUTPUT,
  TEMP,
} from './constants';

const $ = gulpLoadPlugins();
const pwd = process.cwd();

const getKey = filename => path.basename(filename, path.extname(filename));

// Lint
function lint(BS, src = []) {
  if (!Array.isArray(src)) {
    throw new TypeError('invalid path');
  }

  const basePaths = [
    path.join(SRC, '**/*.js'),
  ];

  const task = () => gulp.src(basePaths.concat(src))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!BS.active, $.eslint.failOnError()));

  task.displayName = 'lint';

  return task;
}

// Concat
const tmpConcat = BS => src => () => (
  gulp.src(src, { base: SRC })
    .pipe($.newer(TEMP))
    .pipe($.sourcemaps.init())
    // sourcemap start
    .pipe($.babel())
    // sourcemap end
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(TEMP))
    .pipe(BS.stream({ once: true }))
);

const tmpConcatBatch = BS => files => (done) => {
  const tasks = Object.values(files).map(src => (
    tmpConcat(BS)(src)()
  ));

  const streams = merge(...tasks);

  if (streams.isEmpty) {
    done();
    return undefined;
  }

  return streams;
};

/**
 * 合并任务
 * @param {Array.<string>} src - 资源
 * @param {string} filename - 输出文件名
 */
function concat(src, filename) {
  const key = getKey(filename);

  const task = () => (
    gulp.src(src)
      .pipe($.sourcemaps.init())
      // sourcemap start
      .pipe($.babel())
      .pipe($.concat({
        path: filename,
      }))
      .pipe($.uglify({
        // preserveComments: 'license',
        compress: {
          global_defs: {
            __DEV__: process.env.NODE_ENV === 'development',
          },
        },
      }))
      .pipe($.size({ title: `concat:${key}` }))
      .pipe($.rev())
      // sourcemap end
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(OUTPUT))
      .pipe($.rev.manifest({
        base: pwd,
        merge: true,
      }))
      .pipe(gulp.dest(pwd))
  );

  task.displayName = `concat:${key}`;

  return task;
}

// Bundle
const development = b => filename => b.bundle()
  .on('error', log.bind(log, 'Browserify Error'))
  .pipe(source(filename))
  .pipe(gulp.dest(TEMP));

const tmpBundle = BS => (entry, filename, opts = {}) => () => {
  const {
    exclude = [],
  } = opts;

  const b = browserify({
    entries: entry,
    cache: {},
    packageCache: {},
    transform: [babelify],
    plugin: [watchify],
    // apply source maps
    debug: true,
  });

  // exclude vendor
  (Array.isArray(exclude) ? exclude : [exclude]).forEach((lib) => {
    b.exclude(lib);
  });

  // 只有执行bundle()后watchify才能监听update事件
  b.on('update', () => (
    development(b)(filename).pipe(BS.stream({ once: true }))
  ));
  // watchify监听log事件，输出内容X bytes written (Y seconds)，fancy-log添加时间
  b.on('log', log);

  return development(b)(filename);
};

const tmpBundleBatch = BS => (entries, filename, opts = {}) => (done) => {
  const tmp = 'scripts/bundle.[name].js';

  let fname = filename || tmp;
  let { exclude = [] } = opts;

  if (typeof filename === 'object') {
    fname = tmp;
    exclude = filename.exclude || [];
  }

  const tasks = Object.entries(entries).map(([key, entry]) => (
    tmpBundle(BS)(entry, fname.replace('[name]', key), { exclude })()
  ));

  const streams = merge(...tasks);

  if (streams.isEmpty) {
    done();
    return undefined;
  }

  return streams;
};

function bundle(entry, filename, opts = {}) {
  const {
    exclude = [],
  } = opts;

  const key = getKey(filename);

  const task = () => {
    const b = browserify({
      entries: entry,
      cache: {},
      packageCache: {},
      transform: [babelify],
      // apply source maps
      debug: true,
    });

    // exclude vendor
    (Array.isArray(exclude) ? exclude : [exclude]).forEach((lib) => {
      b.exclude(lib);
    });

    return b.bundle()
      .on('error', log.bind(log, 'Browserify Error'))
      .pipe(source(filename))
      .pipe(buffer())
      .pipe($.sourcemaps.init({ loadMaps: true }))
      // sourcemap start
      .pipe($.uglify({
        // preserveComments: 'license',
        compress: {
          global_defs: {
            __DEV__: process.env.NODE_ENV === 'development',
          },
        },
      }))
      .pipe($.size({ title: `bundle:${key}` }))
      .pipe($.rev())
      // sourcemap end
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(OUTPUT))
      .pipe($.rev.manifest({
        base: pwd,
        merge: true,
      }))
      .pipe(gulp.dest(pwd));
  };

  task.displayName = `bundle:${key}`;

  return task;
}

const vendor = (libs = [], filename = 'scripts/vendor.js') => (done) => {
  if (!Array.isArray(libs) || libs.length === 0) {
    done();
    return undefined;
  }

  const b = browserify({
    cache: {},
    packageCache: {},
    transform: [babelify],
    // apply source maps
    debug: true,
  });

  libs.forEach((lib) => {
    b.require(lib);
  });

  return b.bundle()
    .on('error', log.bind(log, 'Browserify Error'))
    .pipe(source(filename))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    // sourcemap start
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(TEMP))
    .pipe($.uglify())
    .pipe($.size({ title: 'vendor' }))
    .pipe($.rev())
    // sourcemap end
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(OUTPUT))
    .pipe($.rev.manifest({
      base: pwd,
      merge: true,
    }))
    .pipe(gulp.dest(pwd));
};

export {
  lint,
  tmpConcat,
  tmpConcatBatch,
  concat,
  tmpBundle,
  tmpBundleBatch,
  bundle,
  vendor,
};
