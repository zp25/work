const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const shortid = require('shortid');

const partials = [
  {
    file: 'anchor.hbs',
    name: 'Anchors',
  },
];

const context = {
  version: shortid.generate(),
  anchors: [
    {
      title: 'Home',
      path: 'https://zp25.ninja',
    },
    {
      title: 'Blog',
      path: 'https://blog.zp25.ninja',
    },
    {
      title: 'Demo',
      path: 'https://demo.zp25.ninja',
    }
  ],
  templates: ['index'],
};

/**
 * 注册Partial
 * @param {String} template 模版文件名称
 * @param {String} name Partial名称
 */
function registerPartials(template, name) {
  const hbs = path.resolve(__dirname, 'views', template);
  const source = fs.readFileSync(hbs, 'utf8');

  Handlebars.registerPartial(name, source);
}

const layout = path.resolve(__dirname, 'views', 'layouts/main.hbs');
const source = fs.readFileSync(layout, 'utf8');
const indexTo = 'app/index.html';

partials.forEach((partial) => {
  const { file, name } = partial;

  registerPartials(file, name);
});

const template = Handlebars.compile(source);
const file = template(context);

fs.writeFileSync(indexTo, file, 'utf8');
