var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var config = require('./config')

var makeRequest = function (uri) {
  var opts = {
    url: 'https://api-v2launch.trakt.tv' + uri,
    method: 'GET',
    json: true,
    headers: {
      'trakt-api-version': 2,
      'trakt-api-key': config.TRAKT_KEY
    }
  }

  return Promise
    .resolve()
    .then(function () {
      return request(opts)
    })
    .spread(function (resp) {
      if (resp.statusCode !== 200) {
        throw new Error('TRAKT responded with ' + resp.statusCode + ' instead of 200')
      }

      return resp.body
    })
}

module.exports.getMovie = function (imdb_id) {
  return makeRequest([
    '',
    'movies',
    imdb_id,
    'stats'
  ].join('/'))
}
