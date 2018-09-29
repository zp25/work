import Templates from '../templates';

document.addEventListener('DOMContentLoaded', () => {
  // Template literals
  const header = Templates.header({
    title: 'Hello World!',
  });

  // Handlebars
  const footer = Template.index.footer({ email: 'zebrap25@gmail.com' });

  const app = document.querySelector('#app');
  app.insertAdjacentHTML('afterbegin', header);
  app.insertAdjacentHTML('beforeend', footer);
});

window.addEventListener('load', () => {
  if (DEV) {
    console.log('Development Mode'); // eslint-disable-line no-console
  }
});
