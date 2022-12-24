const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const _ = require('lodash')
const config = require('../config')

const parseInt = function (str) {
  if (!str) {
    return null
  }

  return _.parseInt(str.replace(/[^0-9]/ig, ''))
}

module.exports = function (imdbId) {
  return Promise
    .resolve()
    .then(function () {
      const req = {
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

      const voteCount = _.get(resp.body, 'imdbVotes')
      const rtScore = _.chain(resp.body)
        .get('Ratings', [])
        .find({ Source: 'Rotten Tomatoes' })
        .get('Value')
        .value()

      return {
        imdb_rating: parseFloat(_.get(resp.body, 'imdbRating')),
        imdb_votes: parseInt(voteCount),
        metacritic_score: _.get(resp.body, 'metascore'),
        rt_score: parseInt(rtScore)
      }
    })
}
