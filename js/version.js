/**
 * Compares site version to local version and refreshes if needed
 * @author      Eric Shim
 * @author      Project Metropolis
 * @version     1.0.0
 * @since       1.0.0
 */

/**
 * Checks site version and updates
 */
function updateVersion() {
  var version;
  var current = localStorage.getItem("site-version");
  new Promise((resolve, reject) => {
    try {
      $.getJSON(`https://${location.host}/version.json`, function (ver) {
        if (ver === undefined) {
          reject();
        }
        version = ver.version;
        resolve();
      }).fail(() => {
        reject();
      });
    } catch (err) {
      reject();
    }
  })
    .then(() => {
      if (version != current) {
        localStorage.setItem("site-version", version);
        location.reload();
      }
    })
    .catch(() => {});
}

/**
 * Runs on page load
 */
$(document).ready(function () {
  updateVersion();
});
