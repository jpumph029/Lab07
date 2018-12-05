'use strict'

// app dependiencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const PORT = process.env.PORT || 3000;

const app = express();

// get project enviroment variables
require('dotenv').config();

// app middleware
app.use(cors());

// ===========================Location api====================================
app.get('/location', (req, res) => {
  searchToLatLng(req.query.data)
  .then(location => res.send(location))
  .catch(error => handleError(error, res))
});

function Location(query, res) {
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
  this.formatted_query = res.body.results[0].formatted_address;
  this.search_query = query;
} 

function searchToLatLng(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url)
  .then(res => {
    return new Location(query, res);
  })
  .catch(error => handleError(error, res));
}

// ==============================Weather Api==========================================
function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
}

app.get('/weather', getWeather);

function getWeather(req, res) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${req.query.data.latitude},${req.query.data.longitude}`;

  return superagent.get(url)
  .then(result => {
    const weatherSummaries = result.body.daily.data.map(day=> {
      return new Weather(day);
    });
    res.send(weatherSummaries);
  })
  .catch(error => handleError(error, res));
}

function handleError(err,res) {
  console.error(err);
  if (res)res.satus(500).send('Sorry, something broke');
}
 
// **************a test route that gives you turtle tim.*****************
// app.get('/testroute', function (req, res) {
//     let animal = { type: 'turtle', name: 'tim' };
//     res.json(animal);
// });

// -------------------------LOCATION-------------------------
function Location(data) {
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}
app.get('/location', (req, res) => {
  console.log('my request object: ', req);
  const locationData = searchToLatLng(req.query.data);
  res.send(locationData);
});
// helper function
function searchToLatLng(query) {
  const geoData = require('./data/geo.json');
  const location = new Location(geoData.results[0]);
  location.search_query = query;
  return location;
}

// -------------------------WEATHER-------------------------
function Weather(data) {
    this.forecast = data.daily.summary;
    this.time = data.currently.time;
  }
  app.get('/weather', (req, res) => {
    console.log('my request object: ', req);
    const weatherData = searchWeather(req.query.data);
    res.send(weatherData);
  });
  // helper function
  function searchWeather(query) {
    const weatherData = require('./data/weather.json');
    const weather = new Weather(weatherData);
    weather.search_query = query;
    return weather;
  }

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});