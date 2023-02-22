const cheerio = require('cheerio')
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const _ = require('lodash')

module.exports = function () {
  return Promise
    .resolve()
    .then(function () {
      return request({
        url: 'https://www.metacritic.com/browse/movies/release-date/theaters/date?ttype[]=1',
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
        }
      })
    })
    .then(function (resp) {
      if (resp.statusCode !== 200) {
        throw new Error('got an incorrect status code: ' + resp.statusCode)
      }

      const $ = cheerio.load(resp.body)
      return $('td.clamp-summary-wrap').toArray()
    })
    .map(function (movie) {
      const $movie = cheerio.load(movie)

      return {
        title: $movie('a.title').text().trim(),
        score: _.parseInt($movie('a.metascore_anchor .metascore_w').first().text().trim())
      }
    })
    .then(function (movies) {
      return _.reject(movies, function (movie) {
        return movie.title.length === 0 || movie.score === 'tbd'
      })
    })
}
