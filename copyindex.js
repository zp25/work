const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const shortid = require('shortid');
const pages = require('./config.json');

// 所有页面通用配置
const context = {
  version: shortid.generate(),
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
const template = Handlebars.compile(source);

Object.entries(pages).forEach(([page, opts]) => {
  const indexTo = `app/${page}.html`;
  const { file, data } = opts;

  registerPartials(file, 'App');

  const pageContext = Object.assign({}, context, data, { page });
  const temp = template(pageContext);

  fs.writeFileSync(indexTo, temp, 'utf8');
});
