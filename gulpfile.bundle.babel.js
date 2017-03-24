import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import {
  PATHS,
  VENDOR,
} from './constants';

const $ = gulpLoadPlugins();
const pwd = process.cwd();

const development = (b, BS) => b.bundle()
  .on('error', $.util.log.bind($.util, 'Browserify Error'))
  .pipe(source('bundle.js'))
  .pipe(gulp.dest(PATHS.scripts.tmp))
  .pipe(BS.stream({ once: true }));

const production = b => b.bundle()
  .on('error', $.util.log.bind($.util, 'Browserify Error'))
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe($.sourcemaps.init({ loadMaps: true }))
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
    base: pwd,
    merge: true,
  }))
  .pipe(gulp.dest(PATHS.root));

// Scripts
const tmpBundle = BS => () => {
  const b = browserify({
    entries: PATHS.scripts.entries,
    cache: {},
    packageCache: {},
    transform: [babelify],
    plugin: [watchify],
    debug: true,
  });

  // exclude vendor
  VENDOR.forEach((lib) => {
    b.exclude(lib);
  });

  // 只有执行bundle()后watchify才能监听update事件
  b.on('update', () => development(b, BS));
  b.on('log', $.util.log);

  return development(b, BS);
};

const bundle = () => {
  const b = browserify({
    entries: PATHS.scripts.entries,
    cache: {},
    packageCache: {},
    transform: [babelify],
  });

  // exclude vendor
  VENDOR.forEach((lib) => {
    b.exclude(lib);
  });

  b.on('log', $.util.log);

  return production(b);
};

const vendor = () => {
  const b = browserify();

  VENDOR.forEach((lib) => {
    b.require(lib);
  });

  b.on('log', $.util.log);

  return b.bundle()
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(gulp.dest(PATHS.scripts.tmp))
    .pipe($.uglify())
    .pipe($.size({ title: 'vendor' }))
    .pipe($.rev())
    .pipe(gulp.dest(PATHS.scripts.dest))
    .pipe($.rev.manifest({
      base: pwd,
      merge: true,
    }))
    .pipe(gulp.dest(PATHS.root));
};

export { tmpBundle, bundle, vendor };
