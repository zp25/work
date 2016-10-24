import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

const $ = gulpLoadPlugins();
const PATHS = {
  entries: [
    'app/scripts/entry.js',
  ],
  tmp: '.tmp/scripts',
  dest: 'dist/scripts',
};
const VENDOR = ['babel-polyfill', 'md5'];

const tmpBundle = BS => () => {
  const b = browserify({
    entries: PATHS.entries,
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
    entries: PATHS.entries,
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

// Scripts
function development(b, BS) {
  return b.bundle()
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(PATHS.tmp))
    .pipe(BS.stream({ once: true }));
}

function production(b) {
  return b.bundle()
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
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.dest));
}

function vendor() {
  const b = browserify({
    debug: true,
  });

  VENDOR.forEach((lib) => {
    b.require(lib);
  });

  b.on('log', $.util.log);

  return b.bundle()
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(gulp.dest(PATHS.tmp))
    .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.uglify())
      .pipe($.size({ title: 'vendor' }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.dest));
}

export { tmpBundle, bundle, vendor };
