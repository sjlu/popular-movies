/* eslint-env mocha */
var Promise = require('bluebird')
var expect = require('must')
var eyes = require('eyes')
var Index = require('../index')

var inspect = eyes.inspector({
  pretty: true,
  hideFunctions: true,
  maxLength: 0
})

describe('all', function () {
  it('should get me a list of movies', function () {
    return Promise
      .bind({
        listBuilder: new Index()
      })
      .then(function () {
        return this.listBuilder.filter()
      })
      .then(function (movies) {
        inspect(movies)
        expect(movies.length).must.be.above(0)
        expect(movies[0]).must.have.keys([
          'title',
          'imdb_id',
          'poster_url'
        ])
      })
  })
})
