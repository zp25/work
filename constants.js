import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ silent: true });

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

const CONTEXT = path.resolve(__dirname, process.env.CONTEXT);

const PATHS = {
  // manifest
  root: './',
  html: {
    src: `${CONTEXT}/**/*.html`,
    dest: 'dist',
  },
  styles: {
    src: `${CONTEXT}/styles/**/*.{scss,css}`,
    tmp: '.tmp/styles',
    dest: 'dist/styles',
    // gulp-sass includePaths
    includePaths: [
      'node_modules/normalize.css',
      'node_modules/zp-ui',
    ],
  },
  scripts: {
    src: `${CONTEXT}/scripts/**/*.js`,
    // webpack
    context: path.resolve(CONTEXT, 'scripts'),
    entry: {
      index: 'index/index.js',
      copy: 'copy/index.js',
    },
    tmp: '.tmp/scripts',
    dest: 'dist/scripts',
  },
  images: {
    src: `${CONTEXT}/images/**/*`,
    tmp: '.tmp/images',
    dest: 'dist/images',
  },
  copy: [`${CONTEXT}/*`, `!${CONTEXT}/*.html`],
  clean: ['.tmp', 'dist/*'],
  manifest: './rev-manifest.json',
  assets: ['.tmp', CONTEXT, 'node_modules'],
};

export {
  HTMLMINIFIER,
  CONTEXT,
  PATHS,
};
