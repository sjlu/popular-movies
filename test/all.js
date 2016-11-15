var index = require('../index')
var expect = require('chai').expect
var inspect = require('../lib/inspect');
var Promise = require('bluebird');

describe('all', function() {

  it('should get me a list of movies', function() {

    return Promise.resolve(index())
      .then(function(movies) {
        inspect(movies)
      })

  })

})
