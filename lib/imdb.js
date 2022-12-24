const cheerio = require('cheerio')
const Promise = require('bluebird')
const request = Promise.promisifyAll(require('request'))
const _ = require('lodash')

const parseNumber = function (str) {
  str = str.replace(/,/g, '')
  return _.parseInt(str)
}

module.exports = function (imdbId) {
  return Promise
    .resolve()
    .then(function () {
      return request.getAsync(`https://www.imdb.com/title/${imdbId}/ratings`)
    })
    .then(function (resp) {
      if (resp.statusCode !== 200) {
        console.warn('IMDB got an incorrect status code: ' + resp.statusCode)
        return
      }

      const $ = cheerio.load(resp.body)
      const rating = $('.ratingTable .bigcell').first().text().trim()
      const count = $('.ratingTable .smallcell').first().text().trim()

      return {
        imdb_rating: parseNumber(rating),
        imdb_count: parseNumber(count)
      }
    })
}
