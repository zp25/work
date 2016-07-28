/** DOMContentLoaded Event */
// document.addEventListener('DOMContentLoaded', function() {
// });

/** Onload Event */
window.addEventListener('load', () => {
  document.querySelector('main').innerHTML = Base.text;

  if (DEBUG) {
    console.log('Development Mode');
  }
});
