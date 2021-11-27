/**
 * Runs on page load
 */
$(document).ready(function() {
    /**
     * Gets the root element of the document
     * @type {HTML Object}
     */
    var elem = document.documentElement;
    // Fullscreens the page on button click
    $(".fullscreen-btn").on("click", function() {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(); // Chrome, Safari, iOS, Android
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen(); // Internet Explorer
        }
    });
})