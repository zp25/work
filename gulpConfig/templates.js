/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import Handlebars from 'handlebars';
import merge from 'merge-stream';
import {
  SRC,
  OUTPUT,
  TEMP,
} from './constants';

const $ = gulpLoadPlugins();
const pwd = process.cwd();

const tmpTemplates = BS => (src, filename, opts = {}) => () => {
  const {
    namespace = 'main',
  } = opts;

  return gulp.src(src, { base: SRC })
    .pipe($.newer(`${TEMP}/${filename}`))
    .pipe($.handlebars({
      handlebars: Handlebars,
    }))
    .pipe($.wrap('Handlebars.template(<%= contents %>)'))
    .pipe($.declare({
      namespace: `Template.${namespace}`,
      noRedeclare: true,
    }))
    .pipe($.concat(filename))
    .pipe(gulp.dest(TEMP))
    .pipe(BS.stream({ once: true }));
};

const tmpTemplatesBatch = BS => (
  (files, filename = 'scripts/template.[name].js') => (done) => {
    const tasks = Object.entries(files).map(([key, src]) => (
      tmpTemplates(BS)(src, filename.replace('[name]', key), {
        namespace: key,
      })()
    ));

    const streams = merge(...tasks);

    if (streams.isEmpty) {
      done();
      return undefined;
    }

    return streams;
  }
);

/**
 * handlebars模板
 * @param {string} src - 模板文件
 * @param {string} filename - 导出文件名
 * @param {Object} opts
 * @param {string} opts.namespace - 配置namespace
 */
function templates(src, filename, opts = {}) {
  const {
    namespace = 'main',
  } = opts;

  const task = () => gulp.src(src)
    .pipe($.handlebars({
      handlebars: Handlebars,
    }))
    .pipe($.wrap('Handlebars.template(<%= contents %>)'))
    .pipe($.declare({
      namespace: `Template.${namespace}`,
      noRedeclare: true,
    }))
    .pipe($.concat({
      path: filename,
    }))
    .pipe($.uglify())
    .pipe($.rev())
    .pipe(gulp.dest(OUTPUT))
    .pipe($.rev.manifest({
      base: pwd,
      merge: true,
    }))
    .pipe(gulp.dest(pwd));

  task.displayName = 'templates';

  return task;
}

export {
  tmpTemplates,
  tmpTemplatesBatch,
  templates,
};
