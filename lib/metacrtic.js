var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var _ = require('lodash');

module.exports = function() {

  return Promise
    .resolve()
    .then(function() {
      return request.getAsync('http://www.metacritic.com/browse/movies/release-date/theaters/date', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
        }
      })
    })
    .spread(function(res, body) {
      if (res.statusCode !== 200) {
        throw new Error('got an incorrect status code: ' + res.statusCode)
      }

      var $ = cheerio.load(body)
      return $('.list_products').first().find('li').toArray()
    })
    .map(function(movie) {
      $movie = cheerio.load(movie)

      return {
        title: $movie('.product_title a').text().trim(),
        score: $movie('.product_score .metascore_w').text().trim()
      }
    })
    .then(function(movies) {
      return _.reject(movies, function(movie) {
        return movie.title.length === 0
      })
    })

}