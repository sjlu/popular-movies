const cheerio = require('cheerio');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));
const _ = require('lodash');

module.exports = () => Promise
  .resolve()
  .then(() => request.getAsync('http://www.metacritic.com/browse/movies/release-date/theaters/date', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36', // eslint-disable-line max-len
    },
  }))
  .spread((res, body) => {
    if (res.statusCode !== 200) {
      throw new Error(`got an incorrect status code: ${res.statusCode}`);
    }

    const $ = cheerio.load(body);
    return $('.list_products').first().find('li')
      .toArray();
  })
  .map(movie => {
    const $movie = cheerio.load(movie);

    return {
      title: $movie('.product_title a').text().trim(),
      score: $movie('.product_score .metascore_w').text().trim(),
    };
  })
  .then(movies => _.reject(movies, movie => movie.title.length === 0));
