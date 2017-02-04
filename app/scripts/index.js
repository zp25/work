import Base from './base';

// document.addEventListener('DOMContentLoaded', () => {
// });

window.addEventListener('load', () => {
  const elem = document.querySelector('.header');
  elem.insertAdjacentHTML('afterbegin', Base.text);

  if (DEV) {
    console.log('Development Mode'); // eslint-disable-line no-console
  }
});
