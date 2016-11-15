var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var _ = require('lodash');

module.exports = function() {

  return Promise
    .resolve()
    .then(function() {
      return request.getAsync('http://www.metacritic.com/browse/movies/release-date/theaters/date?campaign=new2', {
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
      return $('td.wide_col').first().find('tr.summary_row').toArray()
    })
    .map(function(movie) {
      $movie = cheerio.load(movie)

      return {
        title: $movie('.title_wrapper a').text().trim(),
        score: $movie('.score_wrapper .metascore_w').text().trim()
      }
    })
    .then(function(movies) {
      return _.reject(movies, function(movie) {
        return movie.title.length === 0
      })
    })

}
