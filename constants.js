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
    // browserify
    entries: {
      index: 'app/scripts/index/index.js',
    },
    // concat
    concat: [],
    // production不使用
    watch: [
      'app/scripts/misc/**/*.js',
    ],
    tmp: '.tmp/scripts',
    dest: 'dist/scripts',
  },
  images: {
    src: 'app/images/**/*',
    tmp: '.tmp/images',
    dest: 'dist/images',
  },
  templates: {
    // index: 'app/templates/index/*.hbs',
  },
  copy: ['app/*', '!app/*.html', '!app/templates'],
  clean: ['.tmp', 'dist/*'],
  manifest: './rev-manifest.json',
  assets: ['.tmp', 'app', 'node_modules'],
};

const VENDOR = [];

export {
  HTMLMINIFIER,
  PATHS,
  VENDOR,
};
