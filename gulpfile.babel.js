import gulp from 'gulp';
import rimraf from 'rimraf';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import Handlebars from 'handlebars';
import es from 'event-stream';
import {
  HTMLMINIFIER,
  PATHS,
} from './constants';
import { tmpConcat, concat } from './gulpfile.concat.babel';
import { tmpBundle, bundle, vendor } from './gulpfile.bundle.babel';

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

// Templates
function tmpTemplates(done) {
  const tasks = Object.keys(PATHS.templates).map((key) => {
    const fname = `template.${key}.js`;

    return gulp.src(PATHS.templates[key])
      .pipe($.newer(`${PATHS.scripts.tmp}/${fname}`))
      .pipe($.handlebars({
        handlebars: Handlebars,
      }))
      .pipe($.wrap('Handlebars.template(<%= contents %>)'))
      .pipe($.declare({
        namespace: `Template.${key}`,
        noRedeclare: true,
      }))
      .pipe($.concat(fname))
      .pipe(gulp.dest(PATHS.scripts.tmp))
      .pipe(BS.stream({ once: true }));
  });

  es.merge(tasks).on('end', done);
}

function templates(done) {
  const tasks = Object.keys(PATHS.templates).map((key) => {
    const fname = `template.${key}.js`;

    return gulp.src(PATHS.templates[key])
      .pipe($.handlebars({
        handlebars: Handlebars,
      }))
      .pipe($.wrap('Handlebars.template(<%= contents %>)'))
      .pipe($.declare({
        namespace: `Template.${key}`,
        noRedeclare: true,
      }))
      .pipe($.concat({
        path: fname,
        cwd: '',
      }))
      .pipe($.uglify())
      .pipe($.rev())
      .pipe(gulp.dest(PATHS.scripts.dest));
  });

  const manifest = gulp.src(PATHS.manifest);

  es.merge(tasks.concat(manifest))
    .pipe($.rev.manifest({
      base: process.cwd(),
      merge: true,
    }))
    .pipe(gulp.dest(PATHS.root))
    .on('end', done);
}

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
  gulp.watch(Object.values(PATHS.templates), tmpTemplates);

  gulp.watch(PATHS.scripts.src, lint);
  gulp.watch(PATHS.scripts.concat, tmpConcat(BS));
  gulp.watch(PATHS.scripts.watch).on('change', BS.reload);
}

// Clean output directory
function clean(done) {
  rimraf(`{${PATHS.clean.join(',')}}`, done);
}

// Tasks
gulp.task('tmpScript', gulp.parallel(tmpBundle(BS), tmpConcat(BS)));
gulp.task('script', gulp.parallel(bundle, concat));
gulp.task(vendor);

gulp.task('clean:all', gulp.series(clean, vendor));
gulp.task('clean:cache', done => $.cache.clearAll(done));

// Build production files, the default task
gulp.task('default',
  gulp.series(
    'clean:all', lint,
    gulp.parallel('script', sass, images, webp, copy),
    templates,
    html,
  )
);

// run scripts, sass first and run browserSync before watch
gulp.task('serve',
  gulp.series(
    gulp.parallel('tmpScript', tmpSass, tmpWebp),
    tmpTemplates,
    serve,
  )
);
