/**
 * Sets informational details on the site such as datetime
 * @author      Ken Shibata
 * @author      Eric Shim
 * @author      Project Metropolis
 * @version     1.8.7
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
var ms = 0;
/**
 * Stores periods as an array of objects
 * @type {Object|Array.}
 */
var schedule;
/**
 * Stores yesterday's date of month
 * @type {number}
 */
var pdate = 0;
/**
 * Stores promise
 * @type {Promise}
 */
var s_pr;

/**
 * Sets the date and time and calls various other information setting functions
 */
function setDate() {
  /** @type {Object} */
  var today = new Date();

  // Separates datetime information into variables
  /** @type {string} */
  var day = days[today.getDay()];
  /** @type {string} */
  var month = months[today.getMonth()];
  /** @type {number} */
  var date = today.getDate();
  /** @type {number} */
  var hr = today.getHours();
  /** @type {number} */
  var min = today.getMinutes();
  /** @type {number} */
  var sec = today.getSeconds();
  /** @type {number} */
  ms = today.getMilliseconds();
  /** @type {string} */
  var period = "AM";

  // Checks site version every 6 hours from 12:30
  if (hr >= 12 && hr % 6 == 0 && min == 30 && sec == 0) {
    updateVersion();
  }
  // Sets the weather every 4th hour
  if (hr % 4 == 0 && min == 0 && sec == 0) {
    setWeather();
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

  s_pr
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

  // Resets schedule on a new day
  if (pdate != date) {
    setSchedule();
    pdate = date;
  }
}

/**
 * Sets the schedule
 */
function setSchedule() {
  // Sets new promise
  s_pr = new Promise((resolve, reject) => {
    try {
      // Gets the current term from the API
      $.getJSON("https://maclyonsden.com/api/term/current", function (term) {
        if (term === undefined) {
          reject(); // Reject promise if nothing returned
        }
        // Gets the current term schedule from the API
        $.getJSON(
          `https://maclyonsden.com/api/term/${term.id}/schedule`,
          function (sched) {
            if (sched === undefined) {
              reject(); // Reject promise if nothing returned
            }

            schedule = sched;
            var today = new Date();

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
              for (var i = 0; i < schedule.length; i++) {
                /** @type {string} */
                var time;
                // Accounts for lunch period
                if (i == ~~(schedule.length / 2) && i > 0) {
                  //Sets lunch period information
                  time = schedule[i - 1].description.time;
                  time = time.slice(time.lastIndexOf("-") + 1).trim();
                  $(".arrows").append(
                    `<h3><span class="material-icons">keyboard_double_arrow_right</span></h3>`
                  );
                  $(".periods").append(`<h3>Lunch</h3>`);
                  $(".start-times").append(
                    `<h4>${time.replace(/^0+/, "")}</h4>`
                  );
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
                $(".arrows")
                  .children()
                  .css("color", $(":root").css("--bg-grey"));
              }
            }

            resolve(); // Resolve promise if all succeeds
          }
        ).fail(() => {
          reject(); // Reject promise if API request fails
        });
      }).fail(() => {
        reject(); // Reject promise if API request fails
      });
    } catch (err) {
      reject(); // Reject promise if error is thrown
    }
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
  var curr = new Date();
  /** @type {number} */
  var index = -1;

  try {
    /**
     * Middle index, accounts for lunch
     * @type {number}
     */
    var mid = ~~(schedule.length / 2);

    // Checks for current period
    for (var i = 0; i < schedule.length; i++) {
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
        var next = new Date(Date.parse(schedule[0].time.start));
        /**
         * Remaining hours until next period
         * @type {number}
         */
        var hr = next.getHours() - curr.getHours();
        /**
         * Remaining minutes until next period
         * @type {number}
         */
        var min = next.getMinutes() - curr.getMinutes();

        // Time formatting
        if (min < 0) {
          min = 60 + min;
          hr--;
        }

        /**
         * Formatted string showing hours
         * @type {string}
         */
        var hours = hr > 0 ? `${hr} hour${hr != 1 ? "s" : ""} and ` : "";
        /**
         * Formatted string showing minutes
         * @type {string}
         */
        var minutes = `${min} minute${min != 1 ? "s" : ""}`;

        //Sets remaining time until school starts
        $("#next-period").text(`School starts in ${hours}${minutes}`);
      } else {
        //Sets school over
        $("#next-period").text(`School is over`);
      }
    } else {
      var next;

      // Set next depending on current period, accounts for lunch
      if (index == mid) {
        next = new Date(Date.parse(schedule[mid].time.start));
      } else {
        next = new Date(
          Date.parse(schedule[index < mid ? index : index - 1].time.end)
        );
      }

      var hr = next.getHours() - curr.getHours();
      var min = next.getMinutes() - curr.getMinutes();

      // Time formatting
      if (min < 0) {
        min = 60 + min;
        hr--;
      }

      var hours = hr > 0 ? `${hr} hour${hr != 1 ? "s" : ""} and ` : "";
      var minutes = `${min} minute${min != 1 ? "s" : ""}`;

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
 * Sets current weather conditions
 */
function setWeather() {
  getWeather()
    .then(() => {
      // Sets weather data once the promise is resolved
      $("#w-icon").attr("src", `img/weathericons/${weather.WeatherIcon}.svg`);
      $("#w-icon").show();
      $("#temp").text(
        `${Math.round(weather.Temperature.Metric.Value.toFixed(1))}°C`
      );
    })
    .catch((err) => {
      // Otherwise hide the weather data
      $("#w-icon").hide();
      $("#temp").text("Weather Unavailable");
      console.error(`weather fetch failed: ${err}`);
    });
}

/**
 * Gets current weather conditions
 */
async function getWeather() {
  /** @type {string} */
  var apikey = localStorage.getItem("accuweather-api-key");
  if (apikey === null) {
    throw new Error("API Key not found");
  }
  // Gets current weather data from weather API
  $.getJSON(
    `https://dataservice.accuweather.com/currentconditions/v1/49569?apikey=${apikey}`,
    function (wth) {
      if (wth == undefined) {
        throw new Error("API returned nothing"); // Reject promise if nothing returned
      }
      if (wth.length == 0) {
        throw new Error("API returned not enough data"); // Reject promise if nothing returned
      }
      return wth[0]; // Resolve promise if all succeeds
    }
  ).fail(() => {
    throw new Error("API request failed"); // Reject promise if API request fails
  });
}

/**
 * Runs on page load
 */
$(document).ready(function () {
  setSchedule();
  setWeather();
  setDate();
  // Updates datetime every 500 ms after waiting until next second
  setTimeout(setInterval(setDate, 500), 1000 - ms);
});
