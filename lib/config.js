const _ = require('lodash');
const dotenv = require('dotenv');

// load dotenv config vars if available
dotenv.load();

const config = {
  DEBUG: false,
  TMDB_KEY: '',
  TRAKT_KEY: '',
  TMDB_POSTER_URL: 'http://image.tmdb.org/t/p/w500',
  REDISCLOUD_URL: 'redis://localhost:6379',
  AWS_BUCKET: 'popular-movies',
  AWS_KEY: '',
  AWS_SECRET: '',
};

module.exports = _.defaults(process.env, config);
