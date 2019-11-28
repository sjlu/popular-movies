var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var _ = require('lodash')
var config = require('../config')

module.exports = function (imdbId) {
  return Promise
    .resolve()
    .then(function () {
      var req = {
        method: 'GET',
        url: 'http://www.omdbapi.com/',
        qs: {
          i: imdbId,
          apikey: config.OMDB_KEY
        },
        json: true
      }

      return request(req)
    })
    .then(function (resp) {
      if (resp.statusCode !== 200) {
        throw new Error('OMDB responded with ' + resp.statusCode + ' instead of 200')
      }

      return {
        imdb_rating: _.get(resp.body, 'imdbRating'),
        metacritic_score: _.get(resp.body, 'metascore'),
        rt_score: _.chain(resp.body)
          .get('Ratings', [])
          .find({ Source: 'Rotten Tomatoes' })
          .get('Value')
          .replace('%', '')
          .parseInt()
          .value()
      }
    })
}
