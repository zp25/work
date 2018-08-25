import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import log from 'fancy-log';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import es from 'event-stream';
import {
  PATHS,
  VENDOR,
} from './constants';

const $ = gulpLoadPlugins();
const pwd = process.cwd();

const {
  root: rootPath,
  scripts: {
    entries: entriesPath,
    tmp: tmpPath,
    dest: destPath,
  },
  manifest: manifestPath,
} = PATHS;

const development = entry => b => BS => b.bundle()
  .on('error', log.bind(log, 'Browserify Error'))
  .pipe(source(`bundle.${entry}.js`))
  .pipe(gulp.dest(tmpPath))
  .pipe(BS.stream({ once: true }));

const production = entry => b => b.bundle()
  .on('error', log.bind(log, 'Browserify Error'))
  .pipe(source(`bundle.${entry}.js`))
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
    .pipe($.size({ title: 'scripts', showFiles: true }))
    .pipe($.rev())
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest(destPath));

// Scripts
const tmpBundle = BS => (done) => {
  const tasks = Object.keys(entriesPath).map((entry) => {
    const b = browserify({
      entries: entriesPath[entry],
      cache: {},
      packageCache: {},
      transform: [babelify],
      plugin: [watchify],
      // apply source maps
      debug: true,
    });

    // exclude vendor
    VENDOR.forEach((lib) => {
      b.exclude(lib);
    });

    // 只有执行bundle()后watchify才能监听update事件
    b.on('update', () => development(entry)(b)(BS));
    // watchify监听log事件，输出内容X bytes written (Y seconds)，fancy-log添加时间
    b.on('log', log);

    return development(entry)(b)(BS);
  });

  es.merge(tasks).on('end', done);
};

const bundle = (done) => {
  const tasks = Object.keys(entriesPath).map((entry) => {
    const b = browserify({
      entries: entriesPath[entry],
      cache: {},
      packageCache: {},
      transform: [babelify],
      // apply source maps
      debug: true,
    });

    // exclude vendor
    VENDOR.forEach((lib) => {
      b.exclude(lib);
    });

    return production(entry)(b);
  });

  const manifest = gulp.src(manifestPath);

  es.merge(tasks.concat(manifest))
    .pipe($.rev.manifest({
      base: pwd,
      merge: true,
    }))
    .pipe(gulp.dest(rootPath))
    .on('end', done);
};

const vendor = (done) => {
  if (!VENDOR || VENDOR.length === 0) {
    done();
    return;
  }

  const b = browserify({
    cache: {},
    packageCache: {},
    transform: [babelify],
    // apply source maps
    debug: true,
  });

  VENDOR.forEach((lib) => {
    b.require(lib);
  });

  return b.bundle()
    .on('error', log.bind(log, 'Browserify Error'))
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest(tmpPath))
      .pipe($.uglify())
      .pipe($.size({ title: 'vendor' }))
      .pipe($.rev())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(destPath))
    .pipe($.rev.manifest({
      base: pwd,
      merge: true,
    }))
    .pipe(gulp.dest(rootPath));
};

export { tmpBundle, bundle, vendor };
