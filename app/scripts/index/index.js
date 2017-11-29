import 'babel-polyfill';
import Base from '../constants';

document.addEventListener('DOMContentLoaded', () => {
  const result = Template.index.header({
    header: { title: Base.text },
  });

  const elem = document.querySelector('.header');
  elem.insertAdjacentHTML('afterbegin', result);
});

window.addEventListener('load', () => {
  if (DEV) {
    console.log('Development Mode'); // eslint-disable-line no-console
  }
});
