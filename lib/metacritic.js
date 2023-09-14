const cheerio = require('cheerio')
const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const _ = require('lodash')

async function metacriticRequest (opts) {
  return await request(_.defaultsDeep(opts, {
    url: 'https://www.metacritic.com/browse/movie',
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
    },
    qs: {
      releaseType: 'in-theaters',
      releaseYearMin: 2022,
      page: 1
    }
  }))
}

async function getMovies (page = 1) {
  return Promise
    .resolve()
    .then(function () {
      return metacriticRequest({
        qs: {
          page
        }
      })
    })
    .then(function (resp) {
      if (resp.statusCode !== 200) {
        throw new Error('got an incorrect status code: ' + resp.statusCode)
      }

      const $ = cheerio.load(resp.body)
      return $('.c-finderProductCard').toArray()
    })
    .map(function (movie) {
      const $movie = cheerio.load(movie)

      return {
        title: $movie('.c-finderProductCard_title').text().trim(),
        score: _.parseInt($movie('.c-siteReviewScore').first().text().trim())
      }
    })
    .then(function (movies) {
      return _.reject(movies, function (movie) {
        return movie.title.length === 0 || movie.score === 'tbd'
      })
    })
}

module.exports = async function () {
  const movies = []
  let page = 1
  let movieResults = await getMovies(page)
  while (movieResults.length > 0 && page < 4) {
    movies.push(...movieResults)
    page++
    movieResults = await getMovies(page)
  }

  return movies
}
