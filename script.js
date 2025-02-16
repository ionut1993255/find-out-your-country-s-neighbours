'use strict';

const input = document.querySelector('#country');
const btn = document.querySelector('.btn-country');
const btnGuess = document.querySelector('.btn--guess');
const btnRandom = document.querySelector('.btn--random');
const countriesContainer = document.querySelector('.countries');
const errorContainer = document.querySelector('#error-container');

const ALL_API_URL = 'https://restcountries.com/v2/all';
const NAME_API_URL = 'https://restcountries.com/v2/name/';
const ALPHA_API_URL = 'https://restcountries.com/v2/alpha/';
const GEO_CODE_API_ROOT = 'https://geocode.xyz/';
const GEO_CODE_API_SUFFIX = '?geoit=json&apiKey=658080722139658231609x117113';

input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    getCountryData(input.value);
  }
});

btn.addEventListener('click', function () {
  getCountryData(input.value);
});

btnGuess.addEventListener('click', function () {
  getPosition().then(pos =>
    guessWhereAmI(pos.coords.latitude, pos.coords.longitude)
  );
});

btnRandom.addEventListener('click', function () {
  getRandomCountry();
});

const getCountryData = function (country) {
  if (country === '' || country === null) {
    renderError('Input value is null or empty. 💥💥💥 Try again!');
    return;
  }

  let normalizedCountryName = normalizeCountryName(country);
  refreshDOM();
  fetch(`${NAME_API_URL}${normalizedCountryName}`)
    .then(response => {
      if (!response.ok)
        throw new Error(`Country not found (${response.status})`);
      return response.json();
    })
    .then(data => {
      renderCountry(data[0]);
      if (!data[0].borders) return;
      data[0].borders.forEach(border => renderNeighbour(border));
    })
    .catch(err => {
      renderError(`Something went wrong. 💥💥💥 ${err.message}. Try again!`);
    })
    .finally(() => {
      countriesContainer.style.opacity = '1';
    });
};

function renderNeighbour(neighbour) {
  fetch(`${ALPHA_API_URL}${neighbour}`)
    .then(response => {
      if (!response.ok)
        throw new Error(`Country not found (${response.status}).`);
      return response.json();
    })
    .then(data => {
      renderCountry(data, 'neighbour');
    })
    .catch(err => {
      renderError(`Something went wrong. 💥💥💥 ${err.message}. Try again!`);
    });
}

const guessWhereAmI = function (lat, lng) {
  if ((lat === '' || lat === null) && (lng === '' || lng === null)) {
    renderError('We cannot get your location. 💥💥💥 Try again!');
    return;
  }

  fetch(`${GEO_CODE_API_ROOT}${lat},${lng}${GEO_CODE_API_SUFFIX}`)
    .then(res => {
      if (!res.ok) throw new Error(`Problem with geocoding ${res.status}.`);
      return res.json();
    })
    .then(data => {
      getCountryData(data.country);
    })
    .catch(err => {
      renderError(`Something went wrong. 💥💥💥 ${err.message}. Try again!`);
    });
};

const getRandomCountry = function () {
  fetch(ALL_API_URL)
    .then(response => {
      if (!response.ok)
        throw new Error(`Country not found (${response.status}).`);
      return response.json();
    })
    .then(data => {
      const countriesLength = data.length;
      const randomCountry = Math.floor(Math.random() * countriesLength - 1);
      getCountryData(data[randomCountry].name);
    })
    .catch(err => {
      renderError(`Something went wrong. 💥💥💥 ${err.message}. Try again!`);
    })
    .finally(() => {
      countriesContainer.style.opacity = '1';
    });
};

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      err => reject(err)
    );
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const renderCountry = function (data, className = '') {
  const html = `
  <article class="country ${className}">
    <img class="country__img" src="${data.flag}" alt="Every country's flag"/>
    <div class="country__data">
      <h3 class="country__name">${data.name}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(
        +data.population / 1000000
      ).toFixed(1)} mil. people</p>
      <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
      <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
    </div>
  </article>
  `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = '1';
};

const refreshDOM = function () {
  errorContainer.innerHTML = '';
  countriesContainer.innerHTML = '';
};

const normalizeCountryName = country => {
  return country.trim().toLowerCase();
};

const renderError = function (msg) {
  errorContainer.innerHTML = `<span class="error-message">${msg}</span>`;
  countriesContainer.style.opacity = '1';
};
