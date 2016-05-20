const request = require('request');
const config = require('./config');
const Promise = require('bluebird');

// request.debug = true

const makeRequest = uri => {
  const opts = {
    url: `https://api-v2launch.trakt.tv${uri}`,
    method: 'GET',
    json: true,
    headers: {
      'trakt-api-version': 2,
      'trakt-api-key': config.TRAKT_KEY,
    },
  };

  return Promise.resolve()
    .then(() => new Promise((resolve, reject) => {
      request(opts, (err, response, body) => {
        if (err) return reject(err);
        return resolve([response, body]);
      });
    }))
    .spread((response, body) => {
      if (response.statusCode !== 200) {
        throw new Error(`TRAKT responded with ${response.statusCode} instead of 200`);
      }

      return body;
    });
};

module.exports.getMovie = imdbId =>
  makeRequest([
    '',
    'movies',
    imdbId,
    'stats',
  ].join('/'));
