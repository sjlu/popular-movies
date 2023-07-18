const Promise = require('bluebird')
const moment = require('moment')
const _ = require('lodash')
const tmdb = require('./lib/tmdb')
const fsCache = require('./lib/fs_cache')
const metacritic = require('./lib/metacritic')
const omdb = require('./lib/omdb')
const imdb = require('./lib/imdb')

const getTmdbDetails = function (movies) {
  return Promise
    .resolve(movies)
    .mapSeries(function (movie) {
      return tmdb.searchMovie(movie.title)
        .then(function (tmdbMovie) {
          tmdbMovie.metacritic_score = movie.score
          return tmdbMovie
        })
    })
}

const getImdbId = function (tmdbId) {
  return fsCache.wrap(tmdbId, function () {
    return tmdb.getMovie(tmdbId)
      .then(function (movie) {
        return { imdbId: movie.imdb_id }
      })
  })
}

const associateImdbIds = function (movies) {
  return Promise
    .resolve(movies)
    .mapSeries(function (movie) {
      // we then need to map an imdb_id to each and every movie
      return getImdbId(movie.id)
        .then(function ({ imdbId }) {
          movie.imdb_id = imdbId
          movie.tmdb_id = movie.id
          return movie
        })
    })
}

const getImdbRatings = function (movies) {
  return Promise
    .resolve(movies)
    .map(function (movie) {
      if (movie.imdb_rating && movie.imdb_rating !== 'N/A') {
        return movie
      }

      return imdb(movie.imdb_id)
        .then(function (ratings) {
          return _.assign(movie, ratings)
        })
    }, {
      concurrency: 1
    })
}

const getOmdbRatings = function (movies) {
  return Promise
    .resolve(movies)
    .mapSeries(function (movie) {
      return omdb(movie.imdb_id)
        .then(function (ratings) {
          return _.defaults(movie, ratings)
        })
    })
}

const uniqueMovies = function (movies) {
  return _.uniqBy(movies, 'imdb_id')
}

const sanatizeForResponse = function (movies) {
  return Promise
    .resolve(movies)
    .map(function (movie) {
      return _.pick(movie, ['title', 'tmdb_id', 'imdb_id', 'poster_url'])
    })
}

const filterByMinValue = function (key, value = 0) {
  return function (movies) {
    return _.filter(movies, function (movie) {
      return _.get(movie, key, 0) >= value
    })
  }
}

const filterByMaxValue = function (key, value = 0) {
  return function (movies) {
    return _.filter(movies, function (movie) {
      return _.get(movie, key, 0) <= value
    })
  }
}

const calculateMovieAge = function (movies) {
  return _.map(movies, function (movie) {
    movie.age = moment().diff(movie.release_date, 'days')
    return movie
  })
}

const logger = function (movies) {
  console.table(movies, [
    'id',
    'imdb_id',
    'tmdb_id',
    'title',
    'release_date',
    'age',
    'metacritic_score',
    'imdb_rating',
    'imdb_votes',
    'rt_score',
    'popularity',
    'vote_average',
    'vote_count'
  ])
}

module.exports = (function () {
  //
  // Class builder functions to help cache content but be
  // able to filter after the fact with options
  //
  let allMovies = null

  const getMovies = function () {
    if (allMovies) {
      return allMovies
    }

    return Promise
      .resolve(metacritic())
      .then(getTmdbDetails)
      .then(filterByMinValue('vote_count', 10))
      .then(filterByMinValue('popularity', 30))
      .then(calculateMovieAge)
      .then(filterByMinValue('age', 21))
      .then(filterByMaxValue('age', 365))
      .then(associateImdbIds)
      .then(uniqueMovies)
      .then(getOmdbRatings)
      .then(getImdbRatings)
      .tap(logger)
      .tap(function (movies) {
        allMovies = movies
      })
  }

  const ListBuilder = function () {}

  ListBuilder.prototype.filter = function (opts = {}) {
    return Promise
      .resolve(getMovies())
      .then(filterByMinValue('metacritic_score', opts.min_metacritic_score))
      .then(filterByMinValue('rt_score', opts.min_rt_score))
      .then(filterByMinValue('imdb_rating', opts.min_imdb_rating))
      .then(sanatizeForResponse)
  }

  ListBuilder.prototype.dump = function () {
    return allMovies
  }

  return ListBuilder
})()
