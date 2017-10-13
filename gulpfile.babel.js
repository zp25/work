import gulp from 'gulp';
import rimraf from 'rimraf';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import named from 'vinyl-named';
import webpack from 'webpack';
import gulpWebpack from 'webpack-stream';
import through from 'through2';
import {
  HTMLMINIFIER,
  PATHS,
} from './constants';

import tmpWebpackConfig from './webpack.config';
import webpackConfig from './webpack.production.config';

const $ = gulpLoadPlugins({
  rename: {
    'gulp-rev-replace': 'replace',
  },
});
const BS = browserSync.create();

// Lint JavaScript
function lint() {
  return gulp.src(PATHS.scripts.src)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!BS.active, $.eslint.failOnError()))
}

// Image Optimazation
const makeHashKey = entry => file => [file.contents.toString('utf8'), entry].join('');

function images() {
  return gulp.src(PATHS.images.src)
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      multipass: true,
    }), {
      key: makeHashKey('images'),
    }))
    .pipe(gulp.dest(PATHS.images.dest))
    .pipe($.size({ title: 'images' }));
}

function tmpWebp() {
  return gulp.src(PATHS.images.src)
    .pipe($.cache($.webp({ quality: 75 }), { key: makeHashKey('webp') }))
    .pipe(gulp.dest(PATHS.images.tmp))
    .pipe(BS.stream({ once: true }));
}

function webp() {
  return gulp.src(PATHS.images.src)
    .pipe($.cache($.webp({ quality: 75 }), { key: makeHashKey('webp') }))
    .pipe(gulp.dest(PATHS.images.dest))
    .pipe($.size({ title: 'webp' }));
}

// Copy
function copy() {
  return gulp.src(PATHS.copy)
    .pipe(gulp.dest('dist'))
    .pipe($.size({ title: 'copy' }));
}

// Styles
function tmpSass() {
  const processors = [
    autoprefixer(),
  ];

  return gulp.src(PATHS.styles.src)
    .pipe($.newer(PATHS.styles.tmp))
    .pipe($.sourcemaps.init())
      .pipe(
        $.sass({
          includePaths: PATHS.styles.includePaths,
          precision: 10,
        })
        .on('error', $.sass.logError)
      )
      .pipe($.postcss(processors))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(PATHS.styles.tmp))
    .pipe(BS.stream({ once: true }));
}

function sass() {
  const processors = [
    autoprefixer(),
    cssnano(),
  ];

  return gulp.src(PATHS.styles.src)
    .pipe($.sourcemaps.init())
      .pipe(
        $.sass({
          includePaths: PATHS.styles.includePaths,
          precision: 10,
        })
        .on('error', $.sass.logError)
      )
      .pipe($.postcss(processors))
      .pipe($.size({ title: 'styles' }))
      .pipe($.rev())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.styles.dest))
    .pipe($.rev.manifest({
      base: process.cwd(),
      merge: true,
    }))
    .pipe(gulp.dest(PATHS.root));
}

// Scripts
const tmpScript = () => {
  return gulp.src(PATHS.scripts.src)
    .pipe(named())
    .pipe(gulpWebpack(tmpWebpackConfig, webpack))
    .pipe(gulp.dest(PATHS.scripts.tmp))
    .pipe(BS.stream({ once: true }));
};

const script = () => {
  return gulp.src(PATHS.scripts.src)
    .pipe(named())
    .pipe(gulpWebpack(webpackConfig, webpack))
    .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe(through.obj(function through2(file, enc, cb) {
        // Dont pipe through any source map files as it will be handled by gulp-sourcemaps
        if (!/\.map$/.test(file.path)) {
          this.push(file);
        }

        cb();
      }))
    .pipe($.rev())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.scripts.dest))
    .pipe($.rev.manifest({
      base: process.cwd(),
      merge: true,
    }))
    .pipe(gulp.dest(PATHS.root));
};

// HTML
const html = () => gulp.src(PATHS.html.src)
  .pipe($.useref({
    searchPath: PATHS.assets,
  }))
  .pipe($.replace({
    manifest: gulp.src(PATHS.manifest),
  }))
  .pipe($.inlineSource({
    rootpath: PATHS.html.dest,
    compress: false,
  }))
  .pipe($.if('*.html', $.htmlmin(HTMLMINIFIER)))
  .pipe($.if('*.html', $.size({ title: 'html', showFiles: true })))
  .pipe(gulp.dest(PATHS.html.dest));

// Serve
function serve() {
  BS.init({
    notify: false,
    logPrefix: 'work',
    server: {
      baseDir: PATHS.assets,
    },
    port: 3000,
  });

  gulp.watch(PATHS.html.src).on('change', BS.reload);
  gulp.watch(PATHS.styles.src, tmpSass);
  gulp.watch(PATHS.images.src, tmpWebp);

  gulp.watch(PATHS.scripts.src, gulp.series(lint, tmpScript));
}

// Clean output directory
function clean(done) {
  rimraf(`{${PATHS.clean.join(',')}}`, done);
}

// Tasks
gulp.task('clean:all', clean);
gulp.task('clean:cache', done => $.cache.clearAll(done));

// Build production files, the default task
gulp.task('default',
  gulp.series(
    'clean:all', lint,
    gulp.parallel(script, sass, images, webp, copy),
    html,
  )
);

// run scripts, sass first and run browserSync before watch
gulp.task('serve',
  gulp.series(
    gulp.parallel(tmpScript, tmpSass, tmpWebp),
    serve,
  )
);
