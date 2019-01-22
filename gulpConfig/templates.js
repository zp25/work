/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import Handlebars from 'handlebars';
import merge from 'merge-stream';
import { PATHS } from './constants';

const $ = gulpLoadPlugins();

const {
  root: rootPath,
  scripts: {
    tmp: tmpPath,
    dest: destPath,
  },
  templates: templatesPath,
  manifest: manifestPath,
} = PATHS;

const tmpTemplates = BS => (done) => {
  const entries = Object.entries(templatesPath);

  if (entries.length === 0) {
    done();
    return undefined;
  }

  const tasks = entries.map(([key, hbs]) => {
    const fname = `template.${key}.js`;

    return gulp.src(hbs)
      .pipe($.newer(`${tmpPath}/${fname}`))
      .pipe($.handlebars({
        handlebars: Handlebars,
      }))
      .pipe($.wrap('Handlebars.template(<%= contents %>)'))
      .pipe($.declare({
        namespace: `Template.${key}`,
        noRedeclare: true,
      }))
      .pipe($.concat(fname))
      .pipe(gulp.dest(tmpPath))
      .pipe(BS.stream({ once: true }));
  });

  const streams = merge(...tasks);

  if (streams.isEmpty) {
    done();
    return undefined;
  }

  return streams;
};

function templates(done) {
  const entries = Object.entries(templatesPath);

  if (entries.length === 0) {
    done();
    return undefined;
  }

  const tasks = entries.map(([key, hbs]) => {
    const fname = `template.${key}.js`;

    return gulp.src(hbs)
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
      .pipe(gulp.dest(destPath));
  });

  const manifest = gulp.src(manifestPath);

  const streams = merge(...tasks, manifest);

  if (streams.isEmpty) {
    done();
    return undefined;
  }

  return streams
    .pipe($.rev.manifest({
      base: process.cwd(),
      merge: true,
    }))
    .pipe(gulp.dest(rootPath));
}

export {
  tmpTemplates,
  templates,
};
