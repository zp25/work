import gulp from 'gulp';
import del from 'del';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const BS = browserSync.create();
const AUTOPREFIXER_CONFIG = { browsers: ['last 2 versions'] };
const PATHS = {
  html: {
    src: 'app/**/*.html',
    dest: 'dist',
  },
  styles: {
    src: 'app/styles/**/*.{scss,css}',
    tmp: '.tmp/styles',
    dest: 'dist/styles',
  },
  scripts: {
    src: [
      'app/scripts/**/*.js',
      '!app/scripts/jquery.min.js'
    ],
    concat: [
      '!app/scripts/debug.js'
    ],
    tmp: '.tmp/scripts',
    dest: 'dist/scripts',
  },
  images: {
    src: 'app/images/**/*',
    dest: 'dist/images',
  },
};

// Lint JavaScript
function lint() {
  return gulp.src(PATHS.scripts.src)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!BS.active, $.eslint.failOnError()))
}

// Image Optimazation
function images() {
  return gulp.src(PATHS.images.src)
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      multipass: true,
    })))
    .pipe(gulp.dest(PATHS.images.dest))
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

  return gulp.src(PATHS.styles.src)
    .pipe($.newer(PATHS.styles.tmp))
    .pipe($.sourcemaps.init())
      .pipe($.sass({ precision: 10 })
        .on('error', $.sass.logError)
      )
      .pipe($.postcss(processors))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(PATHS.styles.tmp))
    .pipe(BS.stream({ once: true }));
}

function sass() {
  const processors = [
    autoprefixer(AUTOPREFIXER_CONFIG),
    cssnano()
  ];

  return gulp.src(PATHS.styles.src)
    .pipe($.sourcemaps.init())
      .pipe($.sass({ precision: 10 })
        .on('error', $.sass.logError)
      )
      .pipe($.postcss(processors))
      .pipe($.size({ title: 'styles' }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.styles.dest));
}

// Scripts
function tmpScripts() {
  return gulp.src(PATHS.scripts.src)
    .pipe($.newer(PATHS.scripts.tmp))
    .pipe($.sourcemaps.init())
      .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(PATHS.scripts.tmp))
    .pipe(BS.stream({ once: true }));
}

function scripts() {
  return gulp.src(PATHS.scripts.src.concat(PATHS.scripts.concat))
    .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({
        // preserveComments: 'license',
        compress: {
          global_defs: {
            'DEBUG': false,
          },
        },
      }))
      .pipe($.size({ title: 'scripts' }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.scripts.dest));
}

// HTML
function html() {
  return gulp.src(PATHS.html.src)
    .pipe($.useref({ searchPath: '{.tmp,app}' }))
    .pipe($.if('*.html', $.htmlmin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    })))
    .pipe($.if('*.html', $.size({ title: 'html', showFiles: true })))
    .pipe(gulp.dest(PATHS.html.dest));
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

  gulp.watch(PATHS.html.src).on('change', BS.reload);
  gulp.watch(PATHS.styles.src, tmpSass);
  gulp.watch(PATHS.scripts.src, gulp.parallel(lint, tmpScripts));
  gulp.watch(PATHS.images.src).on('change', BS.reload);
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
