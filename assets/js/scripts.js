var searchButton = document.querySelector("#submit-form");
var nameInputEl = document.querySelector("#city-name");
const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
const apiKey = "6b34c0554f0e144b97a8381c135c09d4";
const maxTableSize = 10;
const cityNamePattern = /^(.+?)(?:, ([a-zA-Z]{2}), ([a-zA-Z]{2}))?$/;

function formSubmitHandler(event) {
  event.preventDefault();
  var value = nameInputEl.value.trim();

  if (cityNamePattern.test(value)) {
    var city = value;
    cityLookup(city);
  } else {
    alert("Invalid input.");
  }
}

function cityLookup(city) {
  var cityName = city;
  var limit = 1;

  const cityIndex = searchHistory.indexOf(city);
  if (cityIndex > -1) {
    searchHistory.splice(cityIndex, 1);
  }

  if (searchHistory.length >= maxTableSize) {
    searchHistory.pop();
  }

  searchHistory.unshift(city);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

  var apiUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    cityName +
    "&limit=" +
    limit +
    "&appid=" +
    apiKey;

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          if (data.length === 0) {
            alert("Invalid city.");
            return;
          } else {
            displayWeather(data[0].lat, data[0].lon);
          }
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to OpenWeatherMap: " + error);
    });
  displayHistory();
  nameInputEl.value = "";
}

function displayHistory() {
  const searchHistoryBox = document.querySelector("#search-history");
  searchHistoryBox.innerHTML = "";

  for (var i = 0; i < searchHistory.length; i++) {
    const savedCity = document.createElement("a");
    savedCity.classList =
      "list-item flex-row justify-space-between align-center saved-city";
    savedCity.setAttribute =
      ("href", "./index.html?city-name=" + searchHistory[i]);
    savedCity.textContent = searchHistory[i];
    (function (city) {
      savedCity.addEventListener("click", function () {
        cityLookup(city);
      });
    })(searchHistory[i]);
    searchHistoryBox.appendChild(savedCity);
  }
}

function displayWeather(lat, lon) {
  var weatherContainerEl = document.querySelector("#weather-container");
  var fiveDayForecastEl = document.querySelector("#forecast-container");
  var citySearchEl = document.querySelector("#city-search-term");
  var weatherBox = document.querySelector("#weather-box");

  weatherContainerEl.innerHTML = "";
  citySearchEl.innerHTML = "";
  fiveDayForecastEl.innerHTML = "";

  weatherBox.style.visibility = "visible";

  var lat = lat;
  var lon = lon;
  var apiUrl =
    "http://api.openweathermap.org/data/2.5/forecast?lat=" +
    lat +
    "&lon=" +
    lon +
    "&units=imperial&appid=" +
    apiKey;

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          const minMaxTemps = getMinMaxTemp(data);

          // Today
          const todayDate = data.list[0].dt_txt.split(" ")[0];
          const currentWeatherEl = createWeatherBox(
            data.list[0],
            minMaxTemps[todayDate]
          );
          weatherContainerEl.appendChild(currentWeatherEl);
          citySearchEl.textContent =
            data.city.name + ", " + data.city.country;

          // 5-Day Forecast

          const middayForecastData = data.list.filter((item) =>
            item.dt_txt.includes("12:00:00")
          );

          middayForecastData.slice(0, 6).forEach((day) => {
            const date = day.dt_txt.split(" ")[0];
            const fiveDayForecastWeatherEl = createWeatherBox(
              day,
              minMaxTemps[date]
            );
            fiveDayForecastEl.appendChild(fiveDayForecastWeatherEl);
          });
          return;
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to OpenWeatherMap: " + error);
    });
}

function createWeatherBox(day, minMaxTemp) {
  const cardDiv = document.createElement("div");
  const cardDivBody = document.createElement("div");
  const forecastDate = document.createElement("h3");
  const weatherIcon = document.createElement("img");
  const weatherDescription = document.createElement("span");
  const weatherConditionsTemp = document.createElement("p");
  const weatherConditionsWind = document.createElement("p");
  const weatherConditionsHum = document.createElement("p");
  const weatherConditionsMinMax = document.createElement("p");

  cardDiv.classList.add("card");
  cardDivBody.classList = "card-body fc-body";
  forecastDate.classList = "card-title fc-title";
  weatherIcon.classList = "card-img-top fc-icon";
  weatherConditionsTemp.classList = "card-text fc-text";
  weatherConditionsWind.classList = "card-text fc-text";
  weatherConditionsHum.classList = "card-text fc-text";
  weatherConditionsMinMax.classList = "card-text fc-text";

  let iconCode = day.weather[0].icon;
  let iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";
  weatherIcon.setAttribute("src", iconUrl);

  weatherDescription.textContent = day.weather[0].description;

  weatherConditionsTemp.textContent = "Temp: " + day.main.temp + "\xB0F";
  weatherConditionsMinMax.textContent =
    "Min: " +
    minMaxTemp.minTemp +
    "\xB0F, Max: " +
    minMaxTemp.maxTemp +
    "\xB0F";
  weatherConditionsWind.textContent = "Wind: " + day.wind.speed + " MPH";
  weatherConditionsHum.textContent = "Humidity: " + day.main.humidity + "%";

  let dateObj = new Date(day.dt * 1000);
  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let formattedDate = new Intl.DateTimeFormat("en-US", options).format(dateObj);
  forecastDate.textContent = formattedDate;

  cardDivBody.appendChild(weatherConditionsTemp);
  cardDivBody.appendChild(weatherConditionsMinMax);
  cardDivBody.appendChild(weatherConditionsWind);
  cardDivBody.appendChild(weatherConditionsHum);
  cardDiv.appendChild(forecastDate);
  cardDiv.appendChild(weatherIcon);
  cardDiv.appendChild(weatherDescription);
  cardDiv.appendChild(cardDivBody);

  return cardDiv;
}

function groupByDay(data) {
  const groupedData = {};

  for (var i = 0; i < data.list.length; i++) {
    var dateObj = data.list[i];
    const date = dateObj.dt_txt.split(" ")[0];
    if (!groupedData[date]) {
      groupedData[date] = [];
    }
    groupedData[date].push(dateObj);
  }

  return groupedData;
}

function getMinMaxTemp(data) {
  const groupedData = groupByDay(data);
  const dailyMinMax = {};

  for (const date in groupedData) {
    const dailyData = groupedData[date];
    let minTemp = Number.MAX_VALUE;
    let maxTemp = Number.MIN_VALUE;

    dailyData.forEach((item) => {
      minTemp = Math.min(minTemp, item.main.temp_min);
      maxTemp = Math.max(maxTemp, item.main.temp_max);
    });

    dailyMinMax[date] = {
      minTemp,
      maxTemp,
    };
  }

  return dailyMinMax;
}

function removeDuplicates(data) {
  let unique = [];
  data.forEach((element) => {
    if (!unique.includes(element)) {
      unique.push(element);
    }
  });
  return unique;
}

displayHistory();
searchButton.addEventListener("submit", formSubmitHandler);