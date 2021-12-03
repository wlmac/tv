/**
 * Sets informational details on the site such as datetime
 * @author      Ken Shibata
 * @author      Eric Shim
 * @author      Project Metropolis
 * @version     1.8.8
 * @since       1.0.0
 */

/**
 * Stores days of the week as strings
 * @type {(string|Array.)}
 */
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/**
 * Stores months of the year as strings
 * @type {(string|Array.)}
 */
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
/**
 * Stores milliseconds since last second
 * @type {number}
 */
let ms = 0;
/**
 * Stores periods as an array of objects
 * @type {Object|Array.}
 */
let schedule;
/**
 * Stores yesterday's date of month
 * @type {number}
 */
let pdate = 0;

/**
 * Sets the date and time and calls various other information setting functions
 */
function setDate() {
  /** @type {Object} */
  let today = new Date();

  // Separates datetime information into variables
  /** @type {string} */
  let day = days[today.getDay()];
  /** @type {string} */
  let month = months[today.getMonth()];
  /** @type {number} */
  let date = today.getDate();
  /** @type {number} */
  let hr = today.getHours();
  /** @type {number} */
  let min = today.getMinutes();
  /** @type {number} */
  let sec = today.getSeconds();
  /** @type {number} */
  ms = today.getMilliseconds();
  /** @type {string} */
  let period = "AM";

  // Checks site version every 6 hours from 12:30
  if (hr >= 12 && hr % 6 == 0 && min == 30 && sec == 0) {
    updateVersion();
  }
  // Sets the weather every 4th hour
  if (hr % 4 == 0 && min == 0 && sec == 0) {
    setWeatherNow(document.getElementById("weather"), myLocation);
  }

  // Time formatting
  if (min < 10) {
    min = "0" + min;
  }
  if (hr >= 12) {
    if (hr > 12) {
      hr -= 12;
    }
    period = "PM";
  }
  if (hr == 0) {
    hr += 12;
  }

  // Sets datetime information
  $("#date").text(`${day}, ${month} ${date}`);
  $("#time").text(`${hr}:${min} ${period}`);

  if (min == 0 && sec == 0) {
    getSchedule()
      .then(() => {
        // Updates the schedule once the promise is resolved
        updateSchedule();
      })
      .catch((err) => {
        // Otherwise sets the error message
        $("#cycle").css("padding-bottom", "0");
        $("#cycle").text("Something went wrong :(");
        $(".arrows").empty();
        $(".periods").empty();
        $(".start-times").empty();
        $("#next-period").text("No schedule loaded");
        console.error(`schedule fetch failed: ${err}`);
      });
  }

  // Resets schedule on a new day
  if (pdate != date) {
    getSchedule();
    pdate = date;
  }
}

async function getSchedule() {
  await fetch("https://maclyonsden.com/api/term/current")
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`resp not ok: ${resp}`);
      }
      return resp;
    })
    .then((resp) => resp.json())
    .then(async (term) => {
      await fetch(`https://maclyonsden.com/api/term/${term.id}/schedule`)
        .then((resp) => {
          if (!resp.ok) {
            throw new Error(`resp not ok: ${resp}`);
          }
          return resp;
        })
        .then((resp) => resp.json())
        .then((sched) => {
          schedule = sched;
          today = new Date();
          if (today.getDay() == 0 || today.getDay() == 6) {
            // Sets schedule information on weekends
            $("#cycle").css("padding-bottom", "0");
            $("#cycle").text("Weekend");
            // Clears previous information
            $(".arrows").empty();
            $(".periods").empty();
            $(".start-times").empty();
            // Sets no school message
            $("#next-period").text("No school today");
          } else {
            // Sets schedule cycle
            $("#cycle").css("padding-bottom", "0.4rem");
            $("#cycle").text(schedule[0].cycle);
            // Clears previous information
            $(".arrows").empty();
            $(".periods").empty();
            $(".start-times").empty();
            $("#next-period").text("No schedule loaded"); // Default
            // Sets periods' name and time
            for (let i = 0; i < schedule.length; i++) {
              /** @type {string} */
              let time;
              // Accounts for lunch period
              if (i == ~~(schedule.length / 2) && i > 0) {
                //Sets lunch period information
                time = schedule[i - 1].description.time;
                time = time.slice(time.lastIndexOf("-") + 1).trim();
                $(".arrows").append(
                  `<h3><span class="material-icons">keyboard_double_arrow_right</span></h3>`
                );
                $(".periods").append(`<h3>Lunch</h3>`);
                $(".start-times").append(`<h4>${time.replace(/^0+/, "")}</h4>`);
              }
              // Sets period information
              time = schedule[i].description.time;
              time = time.slice(0, time.indexOf("-")).trim();
              $(".arrows").append(
                `<h3><span class="material-icons">keyboard_double_arrow_right</span></h3>`
              );
              $(".periods").append(
                `<h3>${schedule[i].description.course}</h3>`
              );
              $(".start-times").append(`<h4>${time.replace(/^0+/, "")}</h4>`);
              $(".arrows").children().css("color", $(":root").css("--bg-grey"));
            }
          }
        });
    });
}

/**
 * Updates the schedule with current/next period
 */
function updateSchedule() {
  /**
   * Current datetime
   * @type {Object}
   */
  let curr = new Date();
  /** @type {number} */
  let index = -1;

  try {
    /**
     * Middle index, accounts for lunch
     * @type {number}
     */
    let mid = ~~(schedule.length / 2);

    // Checks for current period
    for (let i = 0; i < schedule.length; i++) {
      if (
        Date.parse(schedule[i].time.start) < curr.getTime() &&
        curr.getTime() < Date.parse(schedule[i].time.end)
      ) {
        index = i;
        if (i >= mid) {
          index++;
        }
        break;
      }
    }
    // Checks if lunch if current period not found
    if (
      index == -1 &&
      Date.parse(schedule[mid - 1].time.end) < curr.getTime() &&
      curr.getTime() < Date.parse(schedule[mid].time.start)
    ) {
      index = mid;
    }
    // Shows arrow for current period
    $(".arrows").children().css("color", $(":root").css("--bg-grey"));
    if (index != -1) {
      $(".arrows").children().eq(index).css("color", $(":root").css("--gold"));
    }
    if (index == -1) {
      // Checks if before school
      if (
        curr.getTime() < Date.parse(schedule[0].time.start) &&
        curr.getDate() == new Date(Date.parse(schedule[0].time.start)).getDate()
      ) {
        /**
         * Starting time of next period
         * @type {Object}
         */
        let next = new Date(Date.parse(schedule[0].time.start));
        /**
         * Remaining hours until next period
         * @type {number}
         */
        let hr = next.getHours() - curr.getHours();
        /**
         * Remaining minutes until next period
         * @type {number}
         */
        let min = next.getMinutes() - curr.getMinutes();

        // Time formatting
        if (min < 0) {
          min = 60 + min;
          hr--;
        }

        /**
         * Formatted string showing hours
         * @type {string}
         */
        let hours = hr > 0 ? `${hr} hour${hr != 1 ? "s" : ""} and ` : "";
        /**
         * Formatted string showing minutes
         * @type {string}
         */
        let minutes = `${min} minute${min != 1 ? "s" : ""}`;

        //Sets remaining time until school starts
        $("#next-period").text(`School starts in ${hours}${minutes}`);
      } else {
        //Sets school over
        $("#next-period").text(`School is over`);
      }
    } else {
      let next;

      // Set next depending on current period, accounts for lunch
      if (index == mid) {
        next = new Date(Date.parse(schedule[mid].time.start));
      } else {
        next = new Date(
          Date.parse(schedule[index < mid ? index : index - 1].time.end)
        );
      }

      let hr = next.getHours() - curr.getHours();
      let min = next.getMinutes() - curr.getMinutes();

      // Time formatting
      if (min < 0) {
        min = 60 + min;
        hr--;
      }

      let hours = hr > 0 ? `${hr} hour${hr != 1 ? "s" : ""} and ` : "";
      let minutes = `${min} minute${min != 1 ? "s" : ""}`;

      // Set remaining time until period ends
      $("#next-period").text(
        (index == schedule.length
          ? "School"
          : index == mid
          ? "Lunch"
          : "Period") + ` ends in ${hours}${minutes}`
      );
    }
  } catch (err) {} // Do nothing if fails
}

/**
 * Runs on page load
 */
$(document).ready(() => {
  getSchedule();
  setDate();
  // Updates datetime every 500 ms after waiting until next second
  setTimeout(setInterval(setDate, 500), 1000 - ms);
});
