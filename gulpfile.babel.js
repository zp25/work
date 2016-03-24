import gulp from 'gulp';
import del from 'del';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const bs = browserSync.create();
const $ = gulpLoadPlugins();

const excludeJs = [
  '!app/scripts/md5.min.js'
];

// Lint JavaScript
function lint() {
  return gulp.src(['app/scripts/**/*.js'].concat(excludeJs))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!bs.active, $.eslint.failOnError()))
}

// Image Optimazation
function images() {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
}

// Copy
function copy() {
  return gulp.src(['app/*', '!app/*.html'])
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
}

// Styles
function sass() {
  var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];
  var src = [
    'app/styles/**/*.scss',
    'app/styles/**/*.css'
  ];

  return gulp.src(src)
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
      .pipe($.sass({precision: 10})
        .on('error', $.sass.logError)
      )
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
      .pipe($.if('*.css', $.cssnano()))
      .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/styles'));
}

// Scripts
function scripts() {
  var src = [
    'app/scripts/common.js',
    'app/scripts/main.js'
  ];

  src = src.concat(excludeJs);

  return gulp.src(src)
    .pipe($.newer('.tmp/scripts'))
    .pipe($.sourcemaps.init())
      .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({preserveComments: 'some'}))
      .pipe($.size({title: 'scripts'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'));
}

// HTML
function html() {
  return gulp.src('app/**/*.html')
    .pipe($.useref({searchPath: '{.tmp,app}'}))
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('dist'));
}

// Serve
function serve() {
  bs.init({
    notify: false,
    logPrefix: 'work',
    server: {
      baseDir: ['.tmp', 'app']
    },
    port: 3000
  });

  gulp.watch('app/**/*.html', bs.reload);
  gulp.watch('app/styles/**/*.{scss,css}', gulp.parallel(sass, bs.reload));
  gulp.watch('app/scripts/**/*.js', gulp.parallel(lint, scripts, bs.reload));
  gulp.watch('app/images/**/*', bs.reload);
}

// Serve distribution
function serveDist() {
  bs.init({
    notify: false,
    logPrefix: 'work',
    server: 'dist',
    port: 3001
  });
}

// Clean output directory
function clean() {
  return del(['.tmp', 'dist/*']);
}

// Tasks
gulp.task(clean);

// Clean cache
gulp.task('clean:cache', (cb) => $.cache.clearAll(cb));

// Build production files, the default task
gulp.task('default',
  gulp.series(
    clean, sass,
    gulp.parallel(lint, html, scripts, images, copy)
  )
);

// run scripts, sass first and run browserSync before watch
gulp.task('serve',
  gulp.series(
    gulp.parallel(scripts, sass),
    serve
  )
);

// Build and serve the output from the dist build
gulp.task('serve:dist', gulp.series('default', serveDist));
