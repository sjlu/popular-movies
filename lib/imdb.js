const cheerio = require('cheerio')
const Promise = require('bluebird')
const request = Promise.promisifyAll(require('request'))
const _ = require('lodash')

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

      const $ = cheerio.load(resp.body)
      const rating = $('.ratingValue').first().text().trim()

      return _.chain(rating.split('/'))
        .first()
        .parseInt()
        .value()
    })
}
