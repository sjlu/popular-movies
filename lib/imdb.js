var cheerio = require('cheerio')
var Promise = require('bluebird')
var request = Promise.promisifyAll(require('request'))
var _ = require('lodash')

module.exports = function (imdbId) {
  return Promise
    .resolve()
    .then(function () {
      return request.getAsync('https://www.imdb.com/title/' + imdbId)
    })
    .then(function (resp) {
      if (resp.statusCode !== 200) {
        console.warn('IMDB got an incorrect status code: ' + resp.statusCode)
        return
      }

      var $ = cheerio.load(resp.body)
      var rating = $('.ratingValue').first().text().trim()

      return _.chain(rating.split('/'))
        .first()
        .parseInt()
        .value()
    })
}
