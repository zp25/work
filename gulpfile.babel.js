import gulp from 'gulp';
import del from 'del';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const BS = browserSync.create();
const AUTOPREFIXER_CONFIG = { browsers: ['last 2 versions'] };
const STYLE_SRC = [
  'app/styles/**/*.scss',
  'app/styles/**/*.css',
];
const JS_SRC = [
  'app/scripts/common.js',
  'app/scripts/main.js',
  '!app/scripts/jquery.min.js',
];

// Lint JavaScript
function lint() {
  return gulp.src(JS_SRC)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!BS.active, $.eslint.failOnError()))
}

// Image Optimazation
function images() {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({ title: 'images' }));
}

// Copy
function copy() {
  return gulp.src(['app/*', '!app/*.html'])
    .pipe(gulp.dest('dist'))
    .pipe($.size({ title: 'copy' }));
}

// Styles
function tmpSass() {
  const processors = [
    autoprefixer(AUTOPREFIXER_CONFIG)
  ];

  return gulp.src(STYLE_SRC)
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
      .pipe($.sass({ precision: 10 })
        .on('error', $.sass.logError)
      )
      .pipe($.postcss(processors))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'));
}

function sass() {
  const processors = [
    autoprefixer(AUTOPREFIXER_CONFIG),
    cssnano()
  ];

  return gulp.src(STYLE_SRC)
    .pipe($.sourcemaps.init())
      .pipe($.sass({ precision: 10 })
        .on('error', $.sass.logError)
      )
      .pipe($.postcss(processors))
      .pipe($.size({ title: 'styles' }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/styles'));
}

// Scripts
function tmpScripts() {
  return gulp.src(JS_SRC)
    .pipe($.newer('.tmp/scripts'))
    .pipe($.sourcemaps.init())
      .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/scripts'));
}

function scripts() {
  return gulp.src(JS_SRC)
    .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({ preserveComments: 'some' }))
      .pipe($.size({ title: 'scripts' }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'));
}

// HTML
function html() {
  return gulp.src('app/**/*.html')
    .pipe($.useref({ searchPath: '{.tmp,app}' }))
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true,
    })))
    .pipe($.if('*.html', $.size({ title: 'html', showFiles: true })))
    .pipe(gulp.dest('dist'));
}

// Serve
function serve() {
  BS.init({
    notify: false,
    logPrefix: 'work',
    server: {
      baseDir: ['.tmp', 'app'],
    },
    port: 3000,
  });

  gulp.watch('app/**/*.html', BS.reload);
  gulp.watch('app/styles/**/*.{scss,css}', gulp.parallel(tmpSass, BS.reload));
  gulp.watch('app/scripts/**/*.js', gulp.parallel(lint, tmpScripts, BS.reload));
  gulp.watch('app/images/**/*', BS.reload);
}

// Serve distribution
function serveDist() {
  BS.init({
    notify: false,
    logPrefix: 'work',
    server: 'dist',
    port: 3001,
  });
}

// Clean output directory
function clean() {
  return del(['.tmp', 'dist/*']);
}

// Tasks
gulp.task(clean);

// Clean cache
gulp.task('clean:cache', cb => $.cache.clearAll(cb));

// Build production files, the default task
gulp.task('default',
  gulp.series(
    clean, html,
    gulp.parallel(lint, scripts, sass, images, copy)
  )
);

// run scripts, sass first and run browserSync before watch
gulp.task('serve',
  gulp.series(
    gulp.parallel(tmpScripts, tmpSass),
    serve
  )
);

// Build and serve the output from the dist build
gulp.task('serve:dist', gulp.series('default', serveDist));
