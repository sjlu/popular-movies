const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const _ = require('lodash')
const moment = require('moment')
const config = require('../config')

const makeRequest = function (url, data) {
  const opts = {
    method: 'GET',
    baseUrl: 'http://api.themoviedb.org/3',
    url,
    json: true
  }

  opts.qs = _.defaults(data || {}, {
    api_key: config.TMDB_KEY
  })

  return Promise
    .resolve()
    .then(function () {
      return request(opts)
    })
    .then(function (resp) {
      if (resp.statusCode === 429) {
        return Promise.resolve()
          .delay(resp.headers['retry-after'] * 1100)
          .then(function () {
            return makeRequest(url, data)
          })
      }

      if (resp.statusCode !== 200) {
        throw new Error('TMDB responded with ' + resp.statusCode + ' instead of 200')
      }

      return resp.body
    })
}

const formatMovie = function (movie) {
  const details = _.pick(movie, [
    'id',
    'title',
    'release_date',
    'popularity',
    'vote_average',
    'vote_count',
    'poster_path'
  ])
  details.poster_url = config.TMDB_POSTER_URL + details.poster_path
  return details
}

const getMovies = function (page) {
  return makeRequest('/discover/movie', {
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
    'vote_average.gte': 4,
    page: page || 1,
    language: 'en-US',
    region: 'US',
    'release_date.gte': moment().subtract(4, 'months').format('YYYY-MM-DD'),
    'release_date.lte': moment().format('YYYY-MM-DD')
  })
}

module.exports.getMovies = async function () {
  const firstResponse = await getMovies()
  let allMovies = [...firstResponse.results]

  // Fetch remaining pages
  const remainingPages = _.range(firstResponse.page, firstResponse.total_pages)
  for (const page of remainingPages) {
    const response = await getMovies(page)
    allMovies.push(...response.results)
  }

  // Clean and format movies
  allMovies = _.compact(allMovies)
  return allMovies.map(movie => formatMovie(movie))
}

module.exports.getMovie = function (id) {
  return makeRequest('/movie/' + id, {
    append_to_response: 'credits'
  })
}

module.exports.searchMovie = function (title, year) {
  const query = {
    query: title.replace(/[^\w\s]/gi, '')
  }

  if (year) {
    query.year = year
  }

  return makeRequest('/search/movie', query)
    .then(function (results) {
      return _.first(results.results)
    })
    .then(function (movie) {
      return formatMovie(movie)
    })
}
