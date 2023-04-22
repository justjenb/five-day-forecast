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

function formSubmitHandler(event) {
  event.preventDefault();
  var city = nameInputEl.value.trim();
  console.log("city: "+ city);
  if (city) {
    cityLookup(city);
  } else {
    alert("Please enter a city.");
  }
}

function cityLookup(city) {
  var cityName = city;
  var limit = 1;
  var apiUrl =
    "http://api.openweathermap.org/geo/1.0/direct?q=" +
    cityName +
    "&limit=" +
    limit +
    "&appid=" +
    apiKey;

  searchHistory.push(city);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

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
}

function displayHistory() {
  const searchHistoryBox = document.querySelector("#search-history");
  searchHistoryBox.innerHTML = "";
  const reversedSearchHistory = searchHistory.slice().reverse();
  var maxTableSize = 10;
  for (var i = 0; i < Math.min(reversedSearchHistory.length, maxTableSize); i++) {
    const savedCity = document.createElement("a");
    savedCity.classList =
      "list-item flex-row justify-space-between align-center saved-city";
    savedCity.setAttribute =
      ("href", "./index.html?city-name=" + reversedSearchHistory[i]);
    savedCity.textContent = reversedSearchHistory[i];
    (function(city) {
      savedCity.addEventListener("click", function() {
        cityLookup(city);
      });
    })(reversedSearchHistory[i]);
    searchHistoryBox.appendChild(savedCity);
  }
}

function displayWeather(lat, lon) {
  var weatherContainerEl = document.querySelector("#weather-container");
  var citySearchEl = document.querySelector("#city-search-term");
  weatherContainerEl.innerHTML = "";
  citySearchEl.innerHTML = "";

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
            console.log(data);

            const allDays = data.list;

            const cardDiv = document.createElement("div");
            const cardDivBody = document.createElement("div");

            const forecastDate = document.createElement("h3");

            const weatherIcon = document.createElement("img");
            const weatherConditionsTemp = document.createElement("p");
            const weatherConditionsWind = document.createElement("p");
            const weatherConditionsHum = document.createElement("p");

            weatherConditionsTemp.classList = "card-text";
            weatherConditionsWind.classList = "card-text";
            weatherConditionsHum.classList = "card-text";

            forecastDate.classList = "card-title";
            cardDivBody.classList = "card-body";
            weatherIcon.classList = "card-img-top";
            
            cardDiv.classList = "card";
            cardDiv.setAttribute("style", "width: 18rem");
            
            const iconCode = allDays[0].weather[0].icon;
            const iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";
            weatherIcon.setAttribute("src", iconUrl);
            
            weatherConditionsTemp.textContent = "Temp: " + allDays[0].main.temp + "\xB0F";
            weatherConditionsWind.textContent = "Wind: " + allDays[0].wind.speed + " MPH";;
            weatherConditionsHum.textContent = "Humidity: " + allDays[0].main.humidity + "%";
            citySearchEl.textContent = data.city.name;
            forecastDate.textContent = allDays[0].dt_txt;

            https://openweathermap.org/img/wn/10d@2x.png

            cardDivBody.appendChild(weatherConditionsTemp);
            cardDivBody.appendChild(weatherConditionsWind);
            cardDivBody.appendChild(weatherConditionsHum);
            cardDiv.appendChild(forecastDate);
            cardDiv.appendChild(weatherIcon);
            cardDiv.appendChild(cardDivBody);
            weatherContainerEl.appendChild(cardDiv);
            return;
          }
        );
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to OpenWeatherMap: " + error);
  });
}

displayHistory();
searchButton.addEventListener("submit", formSubmitHandler);