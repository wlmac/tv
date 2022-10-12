/**
 * For handling weather stuffs
 * @author      Ken Shibata
 * @author      Eric Shim
 * @author      Patrick Lin
 * @author      Project Metropolis
 * @version     2.0.0
 * @since       1.0.0
 */

async function weather() {
  return await fetch(
    `https://weather.maclyonsden.com/weather`
  )
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`resp not ok: ${resp.status}`);
      }
      return resp;
    })
    .then((resp) => resp.json());
}

function setWeatherData(elem, unit) {
  clearElem(elem);
  elem.className = "weather";
  let title = document.createElement("h1");
  title.className = "temp";
  title.innerText = `${Math.round(unit.consolidated_weather[0].the_temp)}°C`;
  let icon = document.createElement("img");
  icon.className = "w-icon";
  icon.src = `img/weathericons/${unit.icon}.svg`;
  elem.appendChild(icon);
  elem.appendChild(title);
}

function setWeatherError(elem) {
  clearElem(elem);
  elem.className = "weather";
  let title = document.createElement("h1");
  title.className = "temp";
  title.innerText = `Weather Unavailable`;
  elem.appendChild(title);
}

async function setWeatherNow(elem) {
  weather().then(resp => {
    setWeatherData(elem, resp)
  }).catch((err) => {
    setWeatherError(elem);
    console.error(`weather fetch failed: ${err}`);
  });
}

function clearElem(elem) {
  elem.textContent = "";
}
