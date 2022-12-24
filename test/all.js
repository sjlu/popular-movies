/* eslint-env mocha */
const Promise = require('bluebird')
const expect = require('must')
const eyes = require('eyes')
const Index = require('../index')
const imdb = require('../lib/imdb')

const inspect = eyes.inspector({
  pretty: true,
  hideFunctions: true,
  maxLength: 0
})

describe('all', function () {
  it('should get an IMDB rating', function () {
    return Promise
      .bind({
        imdb_id: 'tt1630029'
      })
      .then(function () {
        return imdb(this.imdb_id)
      })
      .then(function (results) {
        inspect(results)
        expect(results.imdb_rating).gt(1)
        expect(results.imdb_count).gt(10000)
      })
  })

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
        expect(movies.length).gt(0)
        expect(movies[0]).must.have.keys([
          'title',
          'imdb_id',
          'poster_url'
        ])
      })
  })
})
