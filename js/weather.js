/**
 * For handling weather stuffs
 * @author      Ken Shibata
 * @author      Eric Shim
 * @author      Project Metropolis
 * @version     1.0.0
 * @since       1.0.0
 */

const locale = "en-ca";
const myLocation = "49569";

async function weather(path) {
  const apikey = localStorage.getItem("accuweather-api-key");
  if (apikey === null) {
    throw new Error("API Key not found");
  }

  return await fetch(
    `https://dataservice.accuweather.com/${path}?language=${encodeURIComponent(
      locale
    )}&apikey=${encodeURIComponent(apikey)}&metric=true`
  )
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`resp not ok: ${resp.status}`);
      }
      return resp;
    })
    .then((resp) => resp.json());
}

async function getWeatherPrev6Hour(location) {
  return (
    await weather(`/currentconditions/v1/${encodeURI(location)}/historical`)
  ).map((unit) => {
    return {
      type: "prev",
      time: new Date(unit.LocalObservationDateTime),
      icon: unit.WeatherIcon,
      daytime: unit.IsDayTime,
      temp: {
        value: unit.Temperature.Metric.Value,
        unit: unit.Temperature.Metric.Unit,
        unitType: unit.Temperature.Metric.UnitType,
      },
    };
  });
}

async function getWeatherNow(location) {
  return (await weather(`/currentconditions/v1/${encodeURI(location)}`)).map(
    (unit) => {
      return {
        type: "now",
        time: new Date(unit.LocalObservationDateTime),
        icon: unit.WeatherIcon,
        daytime: unit.IsDayTime,
        temp: {
          value: unit.Temperature.Metric.Value,
          unit: unit.Temperature.Metric.Unit,
          unitType: unit.Temperature.Metric.UnitType,
        },
      };
    }
  );
}

async function getWeatherNext12Hour(location) {
  return (
    await weather(`/forecasts/v1/hourly/12hour/${encodeURI(location)}`)
  ).map((unit) => {
    return {
      type: "next",
      time: new Date(unit.DateTime),
      icon: unit.WeatherIcon,
      daytime: unit.IsDaylight,
      temp: {
        value: unit.Temperature.Value,
        unit: unit.Temperature.Unit,
        unitType: unit.Temperature.UnitType,
      },
    };
  });
}

async function getWeatherData(location) {
  return (await getWeatherPrev6Hour(location))
    .concat(await getWeatherNow(location))
    .concat(await getWeatherNext12Hour(location));
}

function getWeatherByTime(data, target) {
  if (data.length === 0) throw new TypeError("data.length cannot be 0");
  const tgtH = target.getHours();
  return data.sort(
    (x, y) =>
      Math.abs(tgtH - x.time.getHours()) - Math.abs(tgtH - y.time.getHours())
  )[0];
}

function setWeatherData(elem, unit) {
  clearElem(elem);
  elem.className = "weather";
  let title = document.createElement("h1");
  title.className = "temp";
  title.innerText = `${Math.round(unit.temp.value)}°C`;
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

async function setWeatherNow(elem, location) {
  await getWeatherNow(location)
    .then((data) => setWeatherData(elem, data[0]))
    .catch((err) => {
      setWeatherError(elem);
      console.error(`weather fetch failed: ${err}`);
    });
}

function clearElem(elem) {
  elem.textContent = "";
}

$(document).ready(() =>
  setWeatherNow(document.getElementById("weather"), myLocation)
);
