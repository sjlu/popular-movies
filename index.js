var tmdb = require('./lib/tmdb')
var Promise = require('bluebird');
var config = require('./lib/config');
var moment = require('moment');
var _ = require('lodash');
var inspect = require('./lib/inspect')
var redis = require('./lib/redis');

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
      var tooOld = moment().subtract(1, 'year').valueOf()
      var tooNew = moment().subtract(90, 'days').valueOf()

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

module.exports.getMovies = function(cb) {

  var q = Promise.resolve(tmdb.getMovies())
    .bind({})
    .then(filterByReleaseDate)
    .then(filterByPopularity)
    .then(associateImdbIds)

  if (cb) {
    q.nodeify(cb)
  } else {
    return q
  }

}