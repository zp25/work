import gulp from 'gulp';
import browserSync from 'browser-sync';
import dotenv from 'dotenv';
import { PATHS } from './gulpConfig/constants';
import html from './gulpConfig/html';
import {
  images,
  tmpWebp,
  webp,
} from './gulpConfig/images';
import {
  lint,
  tmpConcat,
  concat,
  tmpBundle,
  bundle,
  vendor,
} from './gulpConfig/scripts';
import {
  stylelint,
  tmpSass,
  sass,
} from './gulpConfig/styles';
import {
  tmpTemplates,
  templates,
} from './gulpConfig/templates';
import {
  copy,
  clean,
  cleanCache,
} from './gulpConfig/utils';
import { name } from './package.json';

dotenv.config({ silent: true });

const BS = browserSync.create();

// Tasks
gulp.task('tmpWebp', tmpWebp(BS));

gulp.task('lint', lint(BS));
gulp.task('tmpConcat', tmpConcat(BS));
gulp.task('tmpBundle', tmpBundle(BS));
gulp.task(vendor);

gulp.task('tmpSass', tmpSass(BS));
gulp.task('tmpTemplates', tmpTemplates(BS));

gulp.task('clean:all', gulp.series(clean, vendor));
gulp.task('clean:cache', cleanCache);

function serve() {
  const {
    html: { src: htmlPath },
    styles: { src: stylesPath },
    scripts: {
      src: scriptsPath,
      concat: concatPath,
      watch: watchPath,
    },
    images: { src: imageSrc },
    templates: templatesPath,
    assets: assetsPath,
  } = PATHS;

  BS.init({
    notify: false,
    logPrefix: name,
    server: {
      baseDir: assetsPath,
    },
    port: process.env.PORT || 3000,
  });

  gulp.watch(htmlPath).on('change', BS.reload);
  gulp.watch(stylesPath, gulp.parallel(stylelint, 'tmpSass'));
  gulp.watch(imageSrc, gulp.parallel('tmpWebp'));
  gulp.watch(Object.values(templatesPath), gulp.parallel('tmpTemplates'));

  gulp.watch(scriptsPath, gulp.parallel('lint'));
  gulp.watch(concatPath, gulp.parallel('tmpConcat'));
  gulp.watch(watchPath).on('change', BS.reload);
}

// Build production files, the default task
gulp.task('default',
  gulp.series(
    'clean:all', 'lint',
    gulp.parallel(concat, bundle, stylelint, sass, images, webp, copy),
    templates,
    html,
  )
);

// run scripts, sass first and run browserSync before watch
gulp.task('serve',
  gulp.series(
    gulp.parallel('tmpConcat', 'tmpBundle', 'tmpSass', 'tmpWebp'),
    'tmpTemplates',
    serve,
  )
);
