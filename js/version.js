/**
 * Compares site version to local version and refreshes if needed
 * @author      Eric Shim
 * @author      Ken Shibata
 * @author      Project Metropolis
 * @version     1.0.1
 * @since       1.0.0
 */

/**
 * Checks site version and updates
 */
async function updateVersion() {
  await fetch(`https://${location.host}/version.json`)
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`resp not ok: ${resp}`);
      }
      return resp;
    })
    .then((resp) => resp.json())
    .then(async (ver) => {
      const current = localStorage.getItem("site-version");
      if (ver.version != current) {
        localStorage.setItem("site-version", ver.version);
        location.reload();
      }
    });
}

/**
 * Runs on page load
 */
$(document).ready(updateVersion);
