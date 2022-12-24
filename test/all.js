/* eslint-env mocha */
const Promise = require('bluebird')
const expect = require('must')
const Index = require('../index')
const imdb = require('../lib/imdb')
const metacritic = require('../lib/metacritic')
const omdb = require('../lib/omdb')

describe('all', function () {
  it('should get a list of movies from metacritic', async function () {
    const movies = await metacritic()
    expect(movies.length).gt(0)
    expect(movies[0].title).to.be.string()
    expect(movies[0].score).to.be.number()
  })

  const IMDB_ID = 'tt11564570'

  it('should get an IMDB rating', async function () {
    const results = await imdb(IMDB_ID)
    expect(results.imdb_rating).gt(1)
    expect(results.imdb_votes).gt(1000)
  })

  it ('should get an omdb response', async function () {
    const results = await omdb(IMDB_ID)
    expect(results.imdb_rating).gt(1)
    expect(results.imdb_votes).gt(1000)
  })

  it('should get me a list of movies', async function () {
    this.timeout(20000)
    var listBuilder = new Index()
    const movies = await listBuilder.filter()

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
})
