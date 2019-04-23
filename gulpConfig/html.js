/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import {
  SRC,
  OUTPUT,
} from './constants';

const $ = gulpLoadPlugins({
  rename: {
    'gulp-rev-replace': 'replace',
  },
});

const HTMLMINIFIER = {
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  minifyCSS: true,
  minifyJS: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
};

/**
 * 是否cleanCss压缩
 * @param {Array.<string>} cleanPath - 需压缩的资源
 */
const cleanCondition = cleanPath => (file) => {
  const basename = path.basename(file.path);

  if (cleanPath.includes(basename)) {
    return true;
  }

  return false;
};

/**
 * 是否跳过useref处理
 * @param {Array.<string>} noAssets - 不需要uesref处理的资源
 */
const filterCondition = noAssets => (file) => {
  const fname = path.relative(path.resolve(SRC), file.path);
  const posixfname = fname.split(path.sep).join('/');

  if (noAssets.includes(posixfname)) {
    return false;
  }

  return true;
};

function html(opts = {}) {
  const {
    // html资源路径
    src = [],
    base = SRC,
    // useref资源路径
    searchPath = [],
    // 需要压缩的css文件
    cleanCss = [],
    manifest = 'rev-manifest.json',
    // 需要跳过useref操作的资源
    noAssets = [],
  } = opts;

  if (!Array.isArray(src)) {
    throw new TypeError('invalid path');
  }

  const basePaths = [
    path.join(SRC, '**/*.html'),
  ];

  const task = () => gulp.src(basePaths.concat(src), { base })
    .pipe($.useref({
      searchPath,
      noAssets: false,
    }))
    .pipe($.replace({
      manifest: gulp.src(manifest),
    }))
    .pipe($.inlineSource({
      rootpath: OUTPUT,
      compress: false,
    }))
    .pipe($.if(cleanCondition(cleanCss), $.cleanCss()))
    .pipe($.filter(filterCondition(noAssets)))
    .pipe($.if('*.html', $.htmlmin(HTMLMINIFIER)))
    .pipe($.if('*.html', $.size({ title: 'html', showFiles: true })))
    .pipe(gulp.dest(OUTPUT));

  task.displayName = 'html';

  return task;
}

export default html;
