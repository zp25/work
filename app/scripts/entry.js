import $ from 'jquery';
import Base from './common';

/**
 * 使用jquery的函数
 */
function useJquery() {
  $('main').html(Base.text);
}

/** DOMContentLoaded Event */
// document.addEventListener('DOMContentLoaded', function() {
// });

/** Onload Event */
window.addEventListener('load', () => {
  useJquery();

  if (DEV) {
    console.log('Development Mode');
  }
});
