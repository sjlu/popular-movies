var Promise = require('bluebird')
var moment = require('moment')
var _ = require('lodash')
var tmdb = require('./lib/tmdb')
var redis = require('./lib/redis')
var winston = require('./lib/winston')
var metacritic = require('./lib/metacritic')
var omdb = require('./lib/omdb')

module.exports = (function () {
  var getMetacriticMovies = function () {
    return Promise
      .resolve()
      .then(function () {
        return metacritic()
      })
      .map(function (metacriticMovie) {
        return tmdb.searchMovie(metacriticMovie.title)
          .then(function (movie) {
            movie.metacritic_score = metacriticMovie.score
            return movie
          })
      }, {
        concurrency: 1
      })
  }

  var getImdbId = function (tmdbId) {
    return Promise
      .resolve()
      .then(function () {
        return redis.get(tmdbId)
      })
      .then(function (imdbId) {
        if (imdbId) {
          return imdbId
        }

        return tmdb.getMovie(tmdbId)
          .then(function (movie) {
            return movie.imdb_id
          })
      })
      .then(function (imdbId) {
        this.imdbId = imdbId

        if (imdbId) {
          return redis.set(tmdbId, imdbId)
        }
      })
      .then(function () {
        return this.imdbId
      })
  }

  var filterByReleaseDate = function (movies) {
    return Promise
      .resolve(movies)
      .then(function (movies) {
        // filter down these movies a little bit
        var tooOld = moment().subtract(2, 'year').valueOf()
        var tooNew = moment().subtract(7, 'days').valueOf()

        return _.filter(movies, function (movie) {
          var releaseDate = moment(movie.release_date, 'YYYY-MM-DD').valueOf()
          return releaseDate >= tooOld && releaseDate <= tooNew
        })
      })
  }

  var filterByPopularity = function (movies) {
    return Promise
      .resolve(movies)
      .then(function (movies) {
        // filter down anything that's waaaay too unpopular
        return _.filter(movies, function (movie) {
          return movie.popularity >= 10.0
        })
      })
  }

  var associateImdbIds = function (movies) {
    return Promise
      .resolve(movies)
      .map(function (movie) {
        // we then need to map an imdb_id to each and every movie
        return getImdbId(movie.id)
          .then(function (imdbId) {
            movie.imdb_id = imdbId
            return movie
          })
      }, {
        concurrency: 1
      })
  }

  var getImdbRatings = function (movies) {
    return movies
  }

  var getOmdbRatings = function (movies) {
    return Promise
      .resolve(movies)
      .map(function (movie) {
        return omdb(movie.imdb_id)
          .then(function (ratings) {
            return _.defaults(movie, ratings)
          })
      }, {
        concurrency: 1
      })
  }

  var uniqueMovies = function (movies) {
    return _.uniq(movies, function (m) {
      return m.imdb_id
    })
  }

  var sanatizeForResponse = function (movies) {
    return Promise
      .resolve(movies)
      .map(function (movie) {
        return _.pick(movie, ['title', 'imdb_id', 'poster_url'])
      })
  }

  var filterByValue = function (key, value) {
    return function (movies) {
      return _.filter(movies, function (movie) {
        return _.get(movie, key, 0) >= value
      })
    }
  }

  var calculateMovieAge = function (movies) {
    return _.map(movies, function (movie) {
      movie.age = moment().diff(movie.release_date, 'days')
      return movie
    })
  }

  var logValues = function (movies) {
    _.each(movies, function (movie) {
      winston.info(movie)
    })

    return movies
  }

  //
  // Class builder functions to help cache content but be
  // able to filter after the fact with options
  //

  var allMovies = null

  var ListBuilder = function () {}

  var getMovies = function () {
    if (allMovies) {
      return allMovies
    }

    return Promise
      .resolve(getMetacriticMovies())
      .bind({})
      .then(filterByReleaseDate)
      .then(filterByValue('vote_count', 10))
      .then(filterByPopularity)
      .then(associateImdbIds)
      .then(getImdbRatings)
      .then(getOmdbRatings)
      .then(uniqueMovies)
      .then(calculateMovieAge)
      .then(logValues)
      .then(function (movies) {
        allMovies = movies
        return movies
      })
  }

  ListBuilder.prototype.filter = function (opts) {
    opts = _.defaults(opts, {
      min_metacritic_score: 0,
      min_imdb_rating: 0,
      min_rt_score: 0
    })

    return Promise
      .resolve(getMovies())
      .then(filterByValue('metacritic_score', opts.min_metacritic_score))
      .then(filterByValue('rt_score', opts.min_rt_score))
      .then(filterByValue('imdb_rating', opts.min_imdb_rating))
      .then(sanatizeForResponse)
  }

  ListBuilder.prototype.dump = function () {
    return getMovies()
  }

  return ListBuilder
})()
