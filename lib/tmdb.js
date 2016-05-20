const request = require('request');
const Promise = require('bluebird');
const config = require('./config');
const _ = require('lodash');
const moment = require('moment');

// request.debug = true;

const makeRequest = (uri, data) => {
  const opts = {
    url: `http://api.themoviedb.org/3${uri}`,
    method: 'GET',
    json: true,
  };

  opts.qs = _.defaults(data || {}, {
    api_key: config.TMDB_KEY,
  });

  return Promise.resolve()
    .then(() => new Promise((resolve, reject) => {
      request(opts, (err, response, body) => {
        if (err) return reject(err);
        return resolve([response, body]);
      });
    }))
    .spread((response, body) => {
      if (response.statusCode === 429) {
        return Promise.resolve()
          .delay(response.headers['retry-after'] * 1100)
          .then(() => makeRequest(uri, data));
      }

      if (response.statusCode !== 200) {
        throw new Error(`TMDB responded with ${response.statusCode} instead of 200`);
      }

      return body;
    });
};

const formatMovie = movie => {
  const picks = [
    'title', 'release_date', 'popularity', 'vote_average', 'id', 'vote_count', 'poster_path',
  ];
  const details = _.pick(movie, picks);
  details.poster_url = config.TMDB_POSTER_URL + details.poster_path;
  return details;
};

const getMovies = page => makeRequest('/discover/movie', {
  sort_by: 'popularity.desc',
  'vote_count.gte': 25,
  'vote_average.gte': 4,
  page: page || 1,
  language: 'en',
  'release_date.gte': moment().subtract(1.5, 'year').format('YYYY-MM-DD'),
  'release_date.lte': moment().subtract(30, 'days').format('YYYY-MM-DD'),
});

module.exports.getMovies = () =>
  Promise.resolve(getMovies())
  .bind({
    movies: [],
  })
  .then(response => {
    const movies = this.movies;

    _.each(response.results, result => {
      movies.push(result);
    });

    return _.range(response.page, response.total_pages);
  })
  .map(page => getMovies(page).then(response => response.results), { concurrency: 1 })
  .each(results => {
    const movies = this.movies;

    _.each(results, result => {
      movies.push(result);
    });
  })
  .then(() => {
    this.movies = _.compact(this.movies);
    return this.movies;
  })
  .map(movie => formatMovie(movie));


module.exports.getMovie = id => makeRequest(`/movie/${id}`);

module.exports.searchMovie = (title, year) => {
  const query = {
    query: title.replace(/[^\w\s]/gi, ''),
  };

  if (year) {
    query.year = year;
  }

  return makeRequest('/search/movie', query)
    .then(results => _.first(results.results))
    .then(movie => formatMovie(movie));
};
