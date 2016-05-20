const index = require('../index');
const inspect = require('../lib/inspect');
const Promise = require('bluebird');

describe('all', () => {
  it('should get me a list of movies', () =>
    Promise.resolve(index())
      .then(movies => inspect(movies))
  );
});
