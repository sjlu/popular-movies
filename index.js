var tmdb = require('./lib/tmdb')
var Promise = require('bluebird');
var config = require('./lib/config');
var moment = require('moment');
var _ = require('lodash');
var inspect = require('./lib/inspect')
var redis = require('./lib/redis');
var Stats = require('fast-stats').Stats;
var trakt = require('./lib/trakt');

var getImdbId = function(tmdb_id) {

  return Promise.resolve()
    .then(function() {
      return redis.getAsync(tmdb_id)
    })
    .then(function(imdb_id) {

      if (imdb_id) {
        return imdb_id
      }

      return tmdb.getMovie(tmdb_id)
        .then(function(movie) {
          return movie.imdb_id
        })

    })
    .then(function(imdb_id) {

      this.imdb_id = imdb_id

      if (imdb_id) {
        return redis.setAsync(tmdb_id, imdb_id)
      }

    })
    .then(function() {

      return this.imdb_id

    })

}

var filterByReleaseDate = function(movies) {

  return Promise.resolve(movies)
    .then(function(movies) {
      // filter down these movies a little bit
      var tooOld = moment().subtract(2, 'year').valueOf()
      var tooNew = moment().subtract(30, 'days').valueOf()

      return _.filter(movies, function(movie) {
        var releaseDate = moment(movie.release_date, 'YYYY-MM-DD').valueOf()
        return releaseDate >= tooOld && releaseDate <= tooNew;
      })
    })

}

var filterByPopularity = function(movies) {

  return Promise.resolve(movies)
    .then(function(movies) {
      // filter down anything that's Waaaay to unpopular
      return _.filter(movies, function(movie) {
        return movie.popularity >= 2.5;
      })

    })

}

var filterByGeometricAverage = function(field) {

  return function(movies) {
    var stats = new Stats().push(_.pluck(movies, field))
    var mean = stats.gmean()

    return _.filter(movies, function(movie) {
      return movie[field] >= mean
    })
  }

}

var associateImdbIds = function(movies) {

  return Promise.resolve(movies)
    .map(function(movie) {

      // we then need to map an imdb_id to each and every movie
      return getImdbId(movie.id)
        .then(function(imdb_id) {
          movie.imdb_id = imdb_id;
          return movie
        })

    }, {concurrency: 1})

}

var getTraktData = function(movies) {

  return Promise.resolve(movies)
    .map(function(movie) {

      return Promise.resolve(trakt.getMovie(movie.imdb_id))
        .then(function(traktMovie) {
          return _.extend(movie, traktMovie)
        })


    }, {concurrency: 1})

}

var sanatizeForResponse = function(movies) {

  return Promise.resolve(movies)
    .map(function(movie) {
      return _.pick(movie, ["title", "imdb_id", "poster_url"])
    })

}

module.exports = function(cb) {

  var q = Promise.resolve(tmdb.getMovies())
    .bind({})
    .then(filterByReleaseDate)
    .then(filterByPopularity)
    .then(filterByGeometricAverage('vote_count'))
    .then(associateImdbIds)
    .then(getTraktData)
    .then(filterByGeometricAverage('plays'))
    .then(sanatizeForResponse)

  if (cb) {
    q.nodeify(cb)
  } else {
    return q
  }

}