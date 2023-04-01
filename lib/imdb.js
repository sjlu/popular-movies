const cheerio = require('cheerio')
const Promise = require('bluebird')
const request = Promise.promisifyAll(require('request'))
const _ = require('lodash')

const parseNumber = function (str) {
  str = str.replace(/,/g, '')
  return _.parseInt(str)
}

module.exports = function (imdbId) {
  if (!imdbId) {
    return
  }

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
      let rating = $('.ratingTable .bigcell').first().text().trim()
      let count = $('.ratingTable .smallcell').first().text().trim()

      // 4/1/23 IMDB is running A/B tests on their ratings page
      if (!rating) {
        const ratingText = $('[data-testid=rating-button__aggregate-rating]')
          .first()
          .text()
          .trim()
          .match(/IMDb Rating(.+)\/10(.+)/i)

        rating = ratingText[1]
        count = ratingText[2]

        count = count.replace(/K$/, '000')
      }

      return {
        imdb_rating: parseNumber(rating),
        imdb_votes: parseNumber(count)
      }
    })
}
