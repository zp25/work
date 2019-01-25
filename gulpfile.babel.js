import gulp from 'gulp';
import browserSync from 'browser-sync';
import dotenv from 'dotenv';
import html from './gulpConfig/html';
import {
  images,
  tmpWebp,
  webp,
} from './gulpConfig/images';
import {
  stylelint,
  tmpSass,
  sass,
} from './gulpConfig/styles';
import {
  lint,
  tmpConcatBatch,
  concat,
  tmpBundleBatch,
  bundle,
  vendor,
} from './gulpConfig/scripts';
import {
  tmpTemplatesBatch,
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

const {
  assets,
  html: htmlPath,
  images: imagePath,
  styles: stylePath,
  includePaths,
  entries,
  concats: concatPath,
  templates: templatePath,
  watch,
} = {
  assets: ['.tmp', 'app', 'node_modules'],
  html: 'app/**/*.html',
  images: 'app/images/**/*',
  styles: 'app/styles/**/*.{scss,css}',
  // gulp-sass includePaths
  includePaths: [
    // 'node_modules/normalize.css',
    'node_modules/zp-ui',
  ],
  // scripts
  entries: {
    index: 'app/scripts/index/index.js',
  },
  concats: {
    common: [
      'app/scripts/concata.js',
      'app/scripts/concatb.js',
    ],
    main: [
      'app/scripts/concatc.js',
    ],
  },
  templates: {
    index: 'app/templates/index/*.hbs',
  },
  // production不使用，其他修改后需要重载页面的文件
  watch: [
    'app/scripts/misc/**/*.js',
  ],
};

const VENDOR = ['zp-lib'];

// Tasks
gulp.task('tmpWebp', tmpWebp(BS)(imagePath));
gulp.task('tmpSass', tmpSass(BS)(stylePath, { includePaths }));

gulp.task('tmpConcat', tmpConcatBatch(BS)(concatPath));
gulp.task('tmpBundle', tmpBundleBatch(BS)(entries, { exclude: VENDOR }));
gulp.task('tmpTemplates', tmpTemplatesBatch(BS)(templatePath));

gulp.task('lint', lint(BS));

function server() {
  const concatList = Object.values(concatPath).reduce((prev, files) => (
    prev.concat(files)
  ), []);

  BS.init({
    notify: false,
    logPrefix: name,
    server: {
      baseDir: assets,
    },
    port: process.env.PORT || 3000,
  });

  gulp.watch(htmlPath).on('change', BS.reload);
  gulp.watch(imagePath, gulp.parallel('tmpWebp'));
  gulp.watch(stylePath, gulp.parallel(stylelint, 'tmpSass'));

  gulp.watch('app/**/*.js', gulp.parallel('lint'));
  gulp.watch(concatList, gulp.parallel('tmpConcat'));
  gulp.watch(Object.values(templatePath), gulp.parallel('tmpTemplates'));

  gulp.watch(watch).on('change', BS.reload);
}

// run scripts, sass first and run browserSync before watch
gulp.task('serve', gulp.series(
  gulp.parallel(
    'tmpWebp',
    'tmpSass',
    'tmpConcat',
    'tmpBundle',
    'tmpTemplates',
  ),
  server,
));

gulp.task('vendor', vendor(VENDOR));
gulp.task('clean:all', gulp.series(clean, 'vendor'));
gulp.task('clean:cache', cleanCache);

const concatList = Object.entries(concatPath).map(([key, src]) => (
  concat(src, `scripts/${key}.js`)
));

const bundleList = Object.entries(entries).map(([key, src]) => (
  bundle(src, `scripts/bundle.${key}.js`, { exclude: VENDOR })
));

const templateList = Object.entries(templatePath).map(([key, src]) => (
  templates(src, `scripts/template.${key}.js`, { namespace: key })
));

// Build production files, the default task
gulp.task('default', gulp.series(
  'clean:all',
  'lint',
  ...concatList,
  ...bundleList,
  ...templateList,
  gulp.parallel(
    stylelint,
    sass(stylePath, { includePaths }),
    images(imagePath),
    webp(imagePath),
    copy(['!app/templates']),
  ),
  html(htmlPath, {
    searchPath: assets,
    cleanCss: ['normalize.css'],
    noAssets: [
      'scripts/common.js',
      'scripts/main.js',
    ],
  }),
));
