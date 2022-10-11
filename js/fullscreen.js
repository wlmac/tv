/**
 * Fullscreens page when button clicked
 * @author      Eric Shim
 * @author      Ken Shibata
 * @author      Patrick Lin
 * @author      Project Metropolis
 * @version     1.0.4
 * @since       1.0.0
 */

$(document).ready(() => {
  /**
   * Gets the root element of the document
   * @type {HTML Object}
   */
  let elem = document.documentElement;

  // Fullscreens the page on button click
  $("#fullscreen-btn").click(() => {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(); // Chrome, Safari, iOS, Android
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen(); // Internet Explorer
    }
  });
});
