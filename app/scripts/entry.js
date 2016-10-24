import Base from './common';

/** DOMContentLoaded Event */
// document.addEventListener('DOMContentLoaded', function() {
// });

/** Onload Event */
window.addEventListener('load', () => {
  const elem = document.querySelector('main');
  elem.insertAdjacentHTML('afterbegin', Base.text);

  if (DEV) {
    console.log('Development Mode');
  }
});
