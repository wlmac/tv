/**
 * Sets announcements on the site
 * @author      Eric Shim
 * @author      Ken Shibata
 * @author      Project Metropolis
 * @version     1.1.5
 * @since       1.0.0
 */

/**
 * Stores announcements as an array of objects
 * @type {(Object|Array.)}
 */
var announcements;
/**
 * Stores clubs as an array of objects
 * @type {(Object|Array.)}
 */
var clubs;
/**
 * Stores announcement index
 * @type {number}
 */
var idx = 0;

/**
 * Returns a club's name based on its ID
 * @param {number} id - Club ID
 * @returns {string} Club name
 */
function getClub(id) {
  for (var i = 0; i < clubs.length; i++) {
    if (clubs[i].id == id) {
      return clubs[i].name;
    }
  }
}

/**
 * Gets announcement list
 */
async function getAnnouncements() {
  // Gets the club list from the API
  return await fetch("https://maclyonsden.com/api/organizations")
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`resp not ok: ${resp}`);
      }
      return resp;
    })
    .then((resp) => resp.json())
    .then(async (orgs) => {
      if (orgs === undefined) {
        throw new Error("API request (for organizations) returned nothing");
      }
      clubs = orgs;
      // Gets the announcement list from the API
      return await fetch("https://maclyonsden.com/api/announcements")
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`resp not ok: ${resp}`);
          }
          return resp;
        })
        .then((resp) => resp.json())
        .then((announce) => {
          if (announce === undefined) {
            throw new Error("API request (for announcement) returned nothing");
          }

          /** @type {number} */
          var index = 0;
          /**
           * Limits how old the announcements are
           * @type {Object}
           */
          var range = new Date();
          range.setDate(range.getDate() - 5); // Sets range to 5 days ago

          // Find oldest announcement in range
          for (index = 0; index < announce.length; index++) {
            if (
              Date.parse(announce[index].last_modified_date) < range.getTime()
            ) {
              break;
            }
          }

          console.log(announce);
          // Sets new announcement list within range
          announcements = announce.slice(0, index + 2);

          // Caps announcement list length at 8
          if (announcements.length > 8) {
            announcements = announcements.slice(0, 8);
          }

          return announcements;
        });
    });
}

/**
 * Sets announcement
 */
function setAnnouncement() {
  try {
    /**
     * Current announcement data
     * @type {Object}
     */
    var post = announcements[idx];
    /**
     * Announcement upload datetime
     * @type {Object}
     */
    var upload = new Date(Date.parse(post.last_modified_date));

    // Separates upload information into variables
    /** @type {string} */
    var month = months[upload.getMonth()];
    /** @type {number} */
    var date = upload.getDate();
    /** @type {number} */
    var hr = upload.getHours();
    /** @type {number} */
    var min = upload.getMinutes();
    /** @type {string} */
    var period = "a.m.";

    // Next announcement
    idx++;
    idx %= announcements.length;

    // Time formatting
    if (min < 10) {
      min = "0" + min;
    }
    if (hr >= 12) {
      if (hr > 12) {
        hr -= 12;
      }
      period = "p.m.";
    }
    if (hr == 0) {
      hr += 12;
    }

    // Sets announcement data
    $("#title").text(post.title);
    $("#org").html(
      `${getClub(
        post.organization.id
      )}<date> • ${month} ${date}, ${hr}:${min} ${period}</date>`
    );
    marked.setOptions({
      breaks: true, // Ensures linebreaks are rendered in markdown
    });
    $("#announcement-body").html(
      marked.parse(
        post.body.replaceAll("/media/", "https://maclyonsden.com/media/") // TODO: match only URLs
      )
    );

    $("#qrcode").empty();
    const qrcode = new QRCode(document.getElementById("qrcode"), {
      text: `https://maclyonsden.com/announcement/${post.id}`,
      width: 130,
      height: 130,
      colorDark: "#000",
      colorLight: "#fff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  } catch (err) {
    console.error(err);
  }
}

/**
 * Runs on page load
 */
async function onLoad() {
  announcements = await getAnnouncements();
  // Sets the announcement once the promise is resolved

  if (announcements.length === 0) {
    throw new Error("no announcements to show");
  }

  if (idx >= announcements.length) {
    idx = 0;
  }

  /**
   * Time until next announcement, 3wpm + 5s * img
   */
  var t = Math.max(
    (announcements[idx].body.split(" ").length * 1000) / 3 +
      5000 * (announcements[idx].body.match(/\/media\//g) || []).length,
    5000
  );

  execute();

  /**
   * Calculates and sets new announcement timeout
   */
  function changeTimer() {
    t = Math.max(
      (announcements[idx].body.split(" ").length * 1000) / 3 +
        5000 * (announcements[idx].body.match(/\/media\//g) || []).length,
      5000
    );
  }

  /**
   * Handles changing and timing of announcements
   */
  function execute() {
    console.log(announcements);
    console.log(announcements[idx].title);
    console.log(~~(t / 1000));

    setAnnouncement();

    // Get new announcement list after cycle
    if (idx == 0) {
      getAnnouncements();
    }

    /** @type {HTML Object} */
    var scrollable = $("#announcement-body");
    scrollable.scrollTop(0); // Sets scrollbar to top
    if (t > 10000) {
      // If announcement timeout is greater than 10s wait 5s before scrolling
      setTimeout(function () {
        scrollable.animate(
          { scrollTop: scrollable.prop("scrollHeight") },
          t - 10000
        );
      }, 5000);
    } else {
      // Else scroll immediately
      scrollable.animate({ scrollTop: scrollable.prop("scrollHeight") }, t);
    }

    // Handles the variable timeout
    changeTimer();
    setTimeout(execute, t);
  }
}

$(document).ready(
  onLoad().catch((err) => {
    // Sets error messages if promise is rejected
    $("#title").text("Something went wrong :(");
    $("#org").text("Please check back later");
    $("#announcement-body").empty();
    console.error(`announcements fetch: ${err}\nstack: ${err.stack}`);
  })
);
