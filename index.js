const tmdb = require('./lib/tmdb');
const Promise = require('bluebird');
const moment = require('moment');
const _ = require('lodash');
const redis = require('./lib/redis');
const Stats = require('fast-stats').Stats;
const trakt = require('./lib/trakt');
const winston = require('./lib/winston');
const metacritic = require('./lib/metacritic');

const getMetacriticMovies = () =>
  Promise
    .resolve()
    .then(() => metacritic())
    .map(metacriticMovie =>
      tmdb.searchMovie(metacriticMovie.title)
        .then(movie => {
          movie.metacritic_score = metacriticMovie.score;
          return movie;
        }), { concurrency: 1 });

const getImdbId = tmdbId =>
  Promise.resolve()
    .then(() => redis.getAsync(tmdbId))
    .then(imdbId => {
      if (imdbId) {
        return imdbId;
      }

      return tmdb.getMovie(tmdbId)
        .then(movie => movie.imdbId);
    })
    .then(imdbId => {
      this.imdbId = imdbId;

      if (imdbId) {
        return redis.setAsync(tmdbId, imdbId);
      }
      return null;
    })
    .then(() => this.imdbId);

const filterByReleaseDate = movies =>
  Promise.resolve(movies)
    .then(resolvedMovies => {
      // filter down these movies a little bit
      const tooOld = moment().subtract(2, 'year').valueOf();
      const tooNew = moment().subtract(7, 'days').valueOf();

      return _.filter(resolvedMovies, movie => {
        const releaseDate = moment(movie.release_date, 'YYYY-MM-DD').valueOf();
        return releaseDate >= tooOld && releaseDate <= tooNew;
      });
    });

const filterByPopularity = movies =>
  Promise.resolve(movies)
    .then(resolvedMovies =>
      // filter down anything that's waaaay too unpopular
      _.filter(resolvedMovies, movie => {
        winston.info('filterByPopularity', {
          title: movie.title,
          popularity: movie.popularity,
        });
        return movie.popularity >= 3.0;
      }));

const filterByVote = movies =>
  Promise.resolve(movies)
    .then(resolvedMovies =>
      // filter down anything that's waaaay too unpopular
      _.filter(resolvedMovies, movie => {
        winston.info('filterByVote', {
          title: movie.title,
          vote_average: movie.vote_average,
        });
        return movie.vote_average >= 2.5;
      }));

const filterByMetacriticScore = movies =>
  Promise.resolve(movies)
    .then(resolvedMovies =>
      // filter down anything that's waaaay too unpopular
      _.filter(resolvedMovies, movie => {
        winston.info('filterByMetacriticScore', {
          title: movie.title,
          metacritic_score: movie.metacritic_score,
        });
        return movie.metacritic_score >= 25;
      }));

const timeWeightField = field => {
  const halfYearAgo = moment().subtract(6, 'months').valueOf();

  return movies =>
    // movies that are less than half a year old
    // get their values multiplied by x2?
    _.map(movies, movie => {
      let value = movie[field];
      if (moment(movie.release_date, 'YYYY-MM-DD').valueOf() > halfYearAgo) {
        value *= 1.5;
      }
      movie[`weighted_${field}`] = value;
      console.log(movie);
      return movie;
    });
};

const filterByGeometricAverage = field =>
  movies => {
    const stats = new Stats().push(_.pluck(movies, field));
    const mean = stats.gmean();

    return _.filter(movies, movie => {
      if (movie[field] < mean) {
        winston.warn(field, {
          title: movie.title,
          mean,
          value: movie[field],
        });
      }

      return movie[field] >= mean;
    });
  };

const associateImdbIds = movies =>
  Promise.resolve(movies)
    .map(movie =>
      // we then need to map an imdbId to each and every movie
      getImdbId(movie.id)
        .then(imdbId => {
          movie.imdbId = imdbId;
          return movie;
        }), { concurrency: 1 });

const getTraktData = movies =>
  Promise.resolve(movies)
    .map(movie =>
      Promise.resolve(trakt.getMovie(movie.imdbId))
        .then(traktMovie => _.extend(movie, traktMovie)), { concurrency: 1 });

const uniqueMovies = movies =>
  _.uniq(movies, m => m.imdbId);


const sanatizeForResponse = movies =>
  Promise.resolve(movies)
    .map(movie => _.pick(movie, ['title', 'imdbId', 'poster_url']));

module.exports = cb =>
  Promise.resolve(getMetacriticMovies())
    .bind({})
    .then(filterByReleaseDate)
    // .then(filterByVote)
    // .then(filterByMetacriticScore)
    .then(filterByPopularity)
    // .then(timeWeightField('vote_count'))
    // .then(filterByGeometricAverage('weighted_vote_count'))
    .then(associateImdbIds)
    // .then(getTraktData)
    // .then(filterByGeometricAverage('plays'))
    .then(uniqueMovies)
    .then(sanatizeForResponse)
    .nodeify(cb);
