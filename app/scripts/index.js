import Base from './base';

// document.addEventListener('DOMContentLoaded', () => {
// });

window.addEventListener('load', () => {
  const result = Template.index.header({
    header: { title: Base.text },
  });

  const elem = document.querySelector('.header');
  elem.insertAdjacentHTML('afterbegin', result);

  if (DEV) {
    console.log('Development Mode'); // eslint-disable-line no-console
  }
});
