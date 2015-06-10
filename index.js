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

module.exports.getMovies = function(cb) {

  var q = Promise.resolve()
    .bind({})

  q = q.then(function() {
    return tmdb.getMovies()
  })
  .then(function(movies) {
    // filter down these movies a little bit
    var tooOld = moment().subtract(1, 'year').valueOf()
    var tooNew = moment().subtract(90, 'days').valueOf()

    return _.filter(movies, function(movie) {
      var releaseDate = moment(movie.release_date, 'YYYY-MM-DD').valueOf()
      return releaseDate >= tooOld && releaseDate <= tooNew;
    })
  })
  .then(function(movies) {

    // filter down anything that's Waaaay to unpopular
    return _.filter(movies, function(movie) {
      return movie.popularity >= 2.5;
    })

  })
  .map(function(movie) {

    // grab and obtain only the necessary information
    var details =  _.pick(movie, ["title", "release_date", "popularity", "vote_average", "id", "vote_count", "poster_path"])
    details.poster_url = config.TMDB_POSTER_URL + details.poster_path;
    return details

  })
  .map(function(movie) {

    // we then need to map an imdb_id to each and every movie
    return getImdbId(movie.id)
      .then(function(imdb_id) {
        movie.imdb_id = imdb_id;
        return movie
      })

  }, {concurrency: 1})

  if (cb) {
    q.nodeify(cb)
  } else {
    return q
  }

}