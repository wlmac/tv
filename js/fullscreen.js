/**
 * Fullscreens page when button clicked
 * @author      Eric Shim
 * @author      Ken Shibata
 * @author      Project Metropolis
 * @version     1.0.3
 * @since       1.0.0
 */

function fullscreen() {
  /**
   * Gets the root element of the document
   * @type {HTML Object}
   */
  let elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen(); // Chrome, Safari, iOS, Android
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen(); // Internet Explorer
  }
}

$(document).ready(() => {
  // Fullscreens the page on button click
  $("#fullscreen-btn").click(() => {
    fullscreen();
  });  
});