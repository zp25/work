import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import Handlebars from 'handlebars';
import es from 'event-stream';
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
    return;
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

  es.merge(tasks).on('end', done);
};

function templates(done) {
  const entries = Object.entries(templatesPath);

  if (entries.length === 0) {
    done();
    return;
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

  es.merge(tasks.concat(manifest))
    .pipe($.rev.manifest({
      base: process.cwd(),
      merge: true,
    }))
    .pipe(gulp.dest(rootPath))
    .on('end', done);
}

export {
  tmpTemplates,
  templates,
};
