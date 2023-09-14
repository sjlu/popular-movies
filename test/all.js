/* eslint-env mocha */
const expect = require('must')
const Index = require('../index')
const imdb = require('../lib/imdb')
const metacritic = require('../lib/metacritic')
const omdb = require('../lib/omdb')
const tmdb = require('../lib/tmdb')

describe('all', function () {
  it('should get a list of movies from metacritic', async function () {
    this.timeout(60000)
    const movies = await metacritic()
    expect(movies.length).gt(0)
    expect(movies[0].title).to.be.string()
    expect(movies[0].score).to.be.number()
  })

  const IMDB_ID = 'tt11564570'
  const TMDB_ID = 661374
  const MOVIE_TITLE = 'Glass Onion: A Knives Out Mystery'

  it('should get an IMDB rating', async function () {
    const results = await imdb(IMDB_ID)
    expect(results.imdb_rating).gt(1)
    expect(results.imdb_votes).gt(1000)
  })

  it('should get an omdb response', async function () {
    const results = await omdb(IMDB_ID)
    expect(results.imdb_rating).gt(1)
    expect(results.imdb_votes).gt(1000)
    expect(results.rt_score).gt(1)
  })

  it('should get tmdb movie', async function () {
    const movie = await tmdb.searchMovie(MOVIE_TITLE)
    expect(movie.id).to.equal(TMDB_ID)
    expect(movie.popularity).gt(1)
    expect(movie.release_date).to.be.string()
  })

  it('should get tmdb id', async function () {
    const movie = await tmdb.getMovie(TMDB_ID)
    expect(movie.imdb_id).to.equal(IMDB_ID)
  })

  it('should get me a list of movies', async function () {
    this.timeout(60000)
    const listBuilder = new Index()
    const movies = await listBuilder.filter()

    expect(movies.length).gt(0)
    expect(movies[0]).must.have.keys([
      'title',
      'imdb_id',
      'tmdb_id',
      'poster_url'
    ])
    expect(movies[0].title).to.be.string()
    expect(movies[0].imdb_id).to.be.string()
    expect(movies[0].poster_url).to.be.string()
  })
})
