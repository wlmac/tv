/**
 * Fullscreens page when button clicked
 * @author      Eric Shim
 * @author      Ken Shibata
 * @author      Project Metropolis
 * @version     1.0.2
 * @since       1.0.0
 */
/**
 * Gets the root element of the document
 * @type {HTML Object}
 */
let elem = document.documentElement;
// Fullscreens the page on button click
document.getElementById("fullscreen-btn").addEventListener("click", () => {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen(); // Chrome, Safari, iOS, Android
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen(); // Internet Explorer
  }
});
