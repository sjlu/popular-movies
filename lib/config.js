var _ = require('lodash');
var dotenv = require('dotenv');

// load dotenv config vars if available
dotenv.load();

var config = {
  DEBUG: false,
  RT_KEY: '',
  TMDB_KEY: '',
  TRAKT_KEY: '',
  TMDB_POSTER_URL: 'http://image.tmdb.org/t/p/w500',
  REDISCLOUD_URL: 'redis://localhost:6379'
};
config = _.defaults(process.env, config);

module.exports = config;