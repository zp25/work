import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { PATHS } from './constants';

const $ = gulpLoadPlugins();
const pwd = process.cwd();

const {
  root: rootPath,
  styles: {
    src: srcPath,
    tmp: tmpPath,
    dest: destPath,
    includePaths,
  },
} = PATHS;

// Lint
const stylelint = () => gulp.src(srcPath)
  .pipe($.stylelint({
    failAfterError: false,
    reporters: [
      {
        formatter: 'verbose',
        console: true,
      },
    ],
  }));

const tmpSass = BS => () => {
  const processors = [
    autoprefixer(),
  ];

  return gulp.src(srcPath)
    .pipe($.newer(tmpPath))
    .pipe($.sourcemaps.init())
      .pipe(
        $.sass({
          includePaths,
          precision: 10,
        })
        .on('error', $.sass.logError)
      )
      .pipe($.postcss(processors))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(tmpPath))
    .pipe(BS.stream({ once: true }));
};

function sass() {
  const processors = [
    autoprefixer(),
    cssnano(),
  ];

  return gulp.src(srcPath)
    .pipe($.sourcemaps.init())
      .pipe(
        $.sass({
          includePaths,
          precision: 10,
        })
        .on('error', $.sass.logError)
      )
      .pipe($.postcss(processors))
      .pipe($.size({ title: 'styles', showFiles: true }))
      .pipe($.rev())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(destPath))
    .pipe($.rev.manifest({
      base: pwd,
      merge: true,
    }))
    .pipe(gulp.dest(rootPath));
}

export {
  stylelint,
  tmpSass,
  sass,
};
