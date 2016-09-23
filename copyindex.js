const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const dotenv = require('dotenv');

dotenv.config({ silent: true });

const layout = path.resolve(__dirname, 'views', 'layouts/main.hbs');
const viewFrom = path.resolve(__dirname, 'views', `${process.env.SCRIPT}.hbs`);
const indexTo = 'app/index.html';

const source = fs.readFileSync(layout, 'utf8');
const context = {
  scripts: fs.readFileSync(viewFrom, 'utf8'),
}

const template = Handlebars.compile(source);
const file = template(context);

fs.writeFileSync(indexTo, file, 'utf8');
