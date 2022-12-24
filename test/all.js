/* eslint-env mocha */
const Promise = require('bluebird')
const expect = require('must')
const Index = require('../index')
const imdb = require('../lib/imdb')
const metacritic = require('../lib/metacritic')

describe('all', function () {
  it('should get a list of movies from metacritic', async function () {
    const movies = await metacritic()
    expect(movies.length).gt(0)
    expect(movies[0].title).to.be.string()
    expect(movies[0].score).to.be.number()
  })

  it('should get an IMDB rating', function () {
    return Promise
      .bind({
        imdb_id: 'tt1630029'
      })
      .then(function () {
        return imdb(this.imdb_id)
      })
      .then(function (results) {
        expect(results.imdb_rating).gt(1)
        expect(results.imdb_votes).gt(10000)
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
        expect(movies.length).gt(0)
        expect(movies[0]).must.have.keys([
          'title',
          'imdb_id',
          'poster_url'
        ])

        expect(movies[0].title).to.be.string()
        expect(movies[0].imdb_id).to.be.string()
        expect(movies[0].poster_url).to.be.string()
      })
  }).timeout(20000)
})
