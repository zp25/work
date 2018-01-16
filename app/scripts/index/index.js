import Template from '../templates';

document.addEventListener('DOMContentLoaded', () => {
  const result = Template.header({
    title: 'Hello World!',
  });

  const elem = document.querySelector('.header');
  elem.insertAdjacentHTML('afterbegin', result);
});

window.addEventListener('load', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Development Mode'); // eslint-disable-line no-console
  }
});
