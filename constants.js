import path from 'path';

const CONTEXT = path.resolve(__dirname, 'app/scripts');

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

const PATHS = {
  root: './',
  html: {
    src: 'app/**/*.html',
    dest: 'dist',
  },
  styles: {
    src: 'app/styles/**/*.{scss,css}',
    tmp: '.tmp/styles',
    dest: 'dist/styles',
    // gulp-sass includePaths
    includePaths: [
      'node_modules/normalize.css',
      'node_modules/zp-ui',
    ],
  },
  scripts: {
    src: 'app/scripts/**/*.js',
    // webpack
    context: CONTEXT,
    entry: {
      index: 'index/index.js',
      copy: 'copy/index.js',
    },
    tmp: '.tmp/scripts',
    dest: 'dist/scripts',
  },
  images: {
    src: 'app/images/**/*',
    tmp: '.tmp/images',
    dest: 'dist/images',
  },
  copy: ['app/*', '!app/*.html', '!app/templates'],
  clean: ['.tmp', 'dist/*'],
  manifest: './rev-manifest.json',
  assets: ['.tmp', 'app', 'node_modules'],
};

export {
  HTMLMINIFIER,
  PATHS,
};
