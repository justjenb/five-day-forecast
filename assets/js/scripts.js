// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, and the wind speed
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

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

  console.log(apiUrl);
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
    "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" +
    lat +
    "&lon=" +
    lon +
    "&units=imperial&appid=" +
    apiKey;

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          console.log(data);
          console.log(data.list);
          console.log(data.list[0]);
          console.log(data.list[0].main);
          console.log(data.list[0].main.temp_max);
          console.log(data.list[0].main.temp_min);
          
          let weatherData = data;
          let weatherDataForecast = data.list;

          const currentWeatherEl = createWeatherBox(weatherData.list[0], weatherData.city.name);
          weatherContainerEl.appendChild(currentWeatherEl);
          citySearchEl.textContent = data.city.name + ', ' + weatherData.city.country;

          for (var i = 1; i < weatherDataForecast.length; i++) {

          const fiveDayForecastWeatherEl = createWeatherBox(weatherData.list[i], weatherData.city.name);

          weatherBox.appendChild(fiveDayForecastWeatherEl);

          }
          const fiveDayCards = fiveDayForecastEl.querySelectorAll(".card")
          console.log("Five day cards :" + fiveDayCards[0]);
          for (var card of fiveDayCards) {
            console.log("Card: " + card);
            card.classList.add('five-day-card');
        }

          var date = new Date();
          console.log(date);

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

function createWeatherBox(day) {
  const cardDiv = document.createElement("div");
  const cardDivBody = document.createElement("div");
  const forecastDate = document.createElement("h3");
  const weatherIcon = document.createElement("img");
  const weatherDescription = document.createElement("span");
  const weatherConditionsTemp = document.createElement("p");
  const weatherConditionsWind = document.createElement("p");
  const weatherConditionsHum = document.createElement("p");

  cardDiv.classList.add("card");
  cardDivBody.classList = "card-body";
  forecastDate.classList = "card-title";
  weatherIcon.classList = "card-img-top";
  weatherConditionsTemp.classList = "card-text";
  weatherConditionsWind.classList = "card-text";
  weatherConditionsHum.classList = "card-text";

  let iconCode = day.weather[0].icon;
  let iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";
  weatherIcon.setAttribute("src", iconUrl);

  weatherDescription.textContent = day.weather[0].description;

  weatherConditionsTemp.textContent = "Temp: " + day.main.temp + "\xB0F";
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
  forecastDate.textContent = day.dt_txt;

  cardDivBody.appendChild(weatherConditionsTemp);
  cardDivBody.appendChild(weatherConditionsWind);
  cardDivBody.appendChild(weatherConditionsHum);
  cardDiv.appendChild(forecastDate);
  cardDiv.appendChild(weatherIcon);
  cardDiv.appendChild(weatherDescription);
  cardDiv.appendChild(cardDivBody);

  return cardDiv;
}

displayHistory();
searchButton.addEventListener("submit", formSubmitHandler);

function displayTime() {
  var dateDisplayEl = $("#currentDay");
  var rightNow = dayjs().format("dddd, MMM DD, YYYY [at] hh:mm:ss a");
  dateDisplayEl.text(rightNow);
}

setInterval(displayTime, 1000);
