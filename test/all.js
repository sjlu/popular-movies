/* eslint-env mocha */
const Promise = require('bluebird')
const expect = require('must')
const eyes = require('eyes')
const Index = require('../index')

const inspect = eyes.inspector({
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
