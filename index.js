var tmdb = require('./lib/tmdb')
var Promise = require('bluebird');
var config = require('./lib/config');
var moment = require('moment');
var _ = require('lodash');
var inspect = require('./lib/inspect')
var redis = require('./lib/redis');
var Stats = require('fast-stats').Stats;
var trakt = require('./lib/trakt');
var winston = require('./lib/winston');
var metacritic = require('./lib/metacritic')

var getMetacriticMovies = function() {

  return Promise
    .resolve()
    .then(function() {
      return metacritic()
    })
    .map(function(metacriticMovie) {
      return tmdb.searchMovie(metacriticMovie.title)
        .then(function(movie) {
          movie.metacritic_score = metacriticMovie.score
          return movie
        })
    }, {concurrency: 1})

}

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
      var tooNew = moment().subtract(7, 'days').valueOf()

      return _.filter(movies, function(movie) {
        var releaseDate = moment(movie.release_date, 'YYYY-MM-DD').valueOf()
        return releaseDate >= tooOld && releaseDate <= tooNew;
      })
    })

}

var filterByPopularity = function(movies) {

  return Promise.resolve(movies)
    .then(function(movies) {
      // filter down anything that's waaaay too unpopular
      return _.filter(movies, function(movie) {
        winston.info('filterByPopularity', {
          title: movie.title,
          popularity: movie.popularity
        })
        return movie.popularity >= 10.0;
      })

    })

}

var filterByVote = function(movies) {

  return Promise.resolve(movies)
    .then(function(movies) {
      // filter down anything that's waaaay too unpopular
      return _.filter(movies, function(movie) {
        winston.info('filterByVote', {
          title: movie.title,
          vote_average: movie.vote_average
        })
        return movie.vote_average >= 2.5;
      })

    })

}

var filterByMetacriticScore = function(movies) {

  return Promise.resolve(movies)
    .then(function(movies) {
      // filter down anything that's waaaay too unpopular
      return _.filter(movies, function(movie) {
        winston.info('filterByMetacriticScore', {
          title: movie.title,
          metacritic_score: movie.metacritic_score
        })
        return movie.metacritic_score >= 25;
      })

    })

}

var timeWeightField = function(field) {

  var halfYearAgo = moment().subtract(6, 'months').valueOf()

  return function(movies) {
    // movies that are less than half a year old
    // get their values multiplied by x2?
    return _.map(movies, function(movie) {
      var value = movie[field]
      if (moment(movie.release_date, 'YYYY-MM-DD').valueOf() > halfYearAgo) {
        value *= 1.5
      }
      movie["weighted_" + field] = value;
      console.log(movie)
      return movie
    })

  }

}

var filterByGeometricAverage = function(field) {

  return function(movies) {
    var stats = new Stats().push(_.pluck(movies, field))
    var mean = stats.gmean()

    return _.filter(movies, function(movie) {
      if (movie[field] < mean) {
        winston.warn(field, {
          title: movie.title,
          mean: mean,
          value: movie[field]
        })
      }

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

var uniqueMovies = function(movies) {

  return _.uniq(movies, function(m) {
    return m.imdb_id;
  })

}

var sanatizeForResponse = function(movies) {

  return Promise.resolve(movies)
    .map(function(movie) {
      return _.pick(movie, ["title", "imdb_id", "poster_url"])
    })

}

var filterByValue = function (key, value) {

  return function (movies) {
    return _.filter(movies, function (movie) {
      return _.get(movie, key, 0) >= value 
    })
  }

}

module.exports = function(cb) {

  return Promise.resolve(getMetacriticMovies())
    .bind({})
    .then(filterByReleaseDate)
    // .then(filterByVote)
    // .then(filterByMetacriticScore)
    .then(filterByValue('vote_count', 10))
    .then(filterByPopularity)
    // .then(timeWeightField('vote_count'))
    // .then(filterByGeometricAverage('weighted_vote_count'))
    .then(associateImdbIds)
    // .then(getTraktData)
    // .then(filterByGeometricAverage('plays'))
    .then(uniqueMovies)
    .then(sanatizeForResponse)
    .nodeify(cb)

}
