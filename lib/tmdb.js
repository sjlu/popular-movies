var Promise = require('bluebird')
var request = Promise.promisify(require('request'))
var _ = require('lodash')
var moment = require('moment')
var config = require('../config')

var makeRequest = function (uri, data) {
  var opts = {
    url: 'http://api.themoviedb.org/3' + uri,
    method: 'GET',
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
            return makeRequest(uri, data)
          })
      }

      if (resp.statusCode !== 200) {
        throw new Error('TMDB responded with ' + resp.statusCode + ' instead of 200')
      }

      return resp.body
    })
}

var formatMovie = function (movie) {
  var details = _.pick(movie, [
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

var getMovies = function (page) {
  return makeRequest('/discover/movie', {
    'sort_by': 'popularity.desc',
    'vote_count.gte': 25,
    'vote_average.gte': 4,
    'page': page || 1,
    'language': 'en',
    'release_date.gte': moment().subtract(1.5, 'year').format('YYYY-MM-DD'),
    'release_date.lte': moment().subtract(30, 'days').format('YYYY-MM-DD')
  })
}

module.exports.getMovies = function () {
  return Promise.resolve(getMovies())
    .bind({
      movies: []
    })
    .then(function (response) {
      var movies = this.movies

      _.each(response.results, function (result) {
        movies.push(result)
      })

      return _.range(response.page, response.total_pages)
    })
    .map(function (page) {
      return getMovies(page)
        .then(function (response) {
          return response.results
        })
    }, { concurrency: 1 })
    .each(function (results) {
      var movies = this.movies

      _.each(results, function (result) {
        movies.push(result)
      })
    })
    .then(function () {
      this.movies = _.compact(this.movies)
      return this.movies
    })
    .map(function (movie) {
      return formatMovie(movie)
    })
}

module.exports.getMovie = function (id) {
  return makeRequest('/movie/' + id)
}

module.exports.searchMovie = function (title, year) {
  var query = {
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
