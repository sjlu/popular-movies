var request = require('request')
var config = require('./config')
var Promise = require('bluebird')

// request.debug = true

var makeRequest = function(uri) {

  var opts = {
    url: "https://api-v2launch.trakt.tv" + uri,
    method: 'GET',
    json: true,
    headers: {
      'trakt-api-version': 2,
      'trakt-api-key': config.TRAKT_KEY
    }
  }

  return Promise.resolve()
    .then(function() {
      return new Promise(function(resolve, reject) {
        request(opts, function(err, response, body) {
          if (err) return reject(err);
          return resolve([response, body]);
        })
      })
    })
    .spread(function(response, body) {
      if (response.statusCode !== 200) {
        throw new Error("TRAKT responded with " + response.statusCode + " instead of 200")
      }

      return body
    })

}

module.exports.getMovie = function(imdb_id) {

  return makeRequest([
    '',
    'movies',
    imdb_id,
    'stats'
  ].join('/'))

}