const AUTOPREFIXER_CONFIG = { browsers: ['last 2 versions'] };

const PATHS = {
  html: {
    src: 'app/**/*.html',
    dest: 'dist',
  },
  styles: {
    src: 'app/styles/**/*.{scss,css}',
    tmp: '.tmp/styles',
    dest: 'dist/styles',
  },
  scripts: {
    src: 'app/scripts/**/*.js',
    entries: [
      'app/scripts/index.js',
    ],
    watch: [
      'app/scripts/dev.js',
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
    index: 'app/templates/index/*.hbs',
  },
  copy: ['app/*', '!app/*.html', '!app/templates'],
  manifest: './',
  assets: ['.tmp', 'app', 'node_modules'],
};

const VENDOR = ['babel-polyfill'];

export {
  AUTOPREFIXER_CONFIG,
  PATHS,
  VENDOR,
};
