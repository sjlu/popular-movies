const Promise = require('bluebird')
const moment = require('moment')
const _ = require('lodash')
const tmdb = require('./lib/tmdb')
const omdb = require('./lib/omdb')
const imdb = require('./lib/imdb')
const metacritic = require('./lib/metacritic')
const anthropic = require('./lib/anthropic')

const getTmdb = function (tmdbId) {
  return tmdb.getMovie(tmdbId)
}

const getTmdbDetails = function (movies) {
  return Promise
    .resolve(movies)
    .mapSeries(function (movie) {
      return getTmdb(movie.id)
        .then(function (tmdbMovie) {
          return _.assign(movie, {
            tmdb_id: tmdbMovie.id,
            imdb_id: tmdbMovie.imdb_id,
            budget: tmdbMovie.budget === 0 ? null : tmdbMovie.budget,
            revenue: tmdbMovie.revenue === 0 ? null : tmdbMovie.revenue,
            top_actors: _.chain(tmdbMovie.credits.cast)
              .take(3)
              .map('name')
              .value(),
            director: tmdbMovie.credits.crew.find(c => c.job === 'Director')?.name,
            production_companies: _.map(tmdbMovie.production_companies, 'name'),
            genres: _.chain(tmdbMovie.genres)
              .map('name')
              .map(name => _.snakeCase(name).toLowerCase())
              .join(', ')
              .value()
          })
        })
    })
}

const getImdbRatings = function (movies) {
  return Promise
    .resolve(movies)
    .map(function (movie) {
      if (movie.imdb_rating && movie.imdb_rating !== 'N/A') {
        return movie
      }

      return imdb(movie.imdb_id)
        .then(function (ratings) {
          return _.assign(movie, ratings)
        })
    }, {
      concurrency: 1
    })
}

const getOmdbRatings = function (movies) {
  return Promise
    .resolve(movies)
    .mapSeries(function (movie) {
      return omdb(movie.imdb_id)
        .then(function (ratings) {
          return _.defaults(movie, ratings)
        })
    })
}

const normalizeTitle = function (title) {
  return title.replace(/[^\w]/gi, '').toLowerCase()
}

const getMetacriticRatings = async function (movies) {
  const metacriticMovies = await metacritic()

  const mappedMovies = _.chain(metacriticMovies)
    .keyBy(m => normalizeTitle(m.title))
    .mapValues('score')
    .value()

  return movies.map(function (movie) {
    return _.assign(movie, {
      metacritic_score: mappedMovies[normalizeTitle(movie.title)]
    })
  })
}

const evaluateMovies = async function (movies) {
  const system = `
You are a movie critic that is given a list of movies released in the last 4 months. Your goal is to suggest and sort order the most popular movies.

You will be given a list of movies with the following details:

- Title
- Production Companies
- Release Date
- Genres
- Budget
- Revenue
- Metacritic Score (0-100)
- Rotten Tomatoes Score (0-100)
- IMDb Rating (0-10)
- IMDb Vote Count
- TMDB Score (0-10)
- TMDB Vote Count
- Top 3 actors in the movie
- Director
- Writer

When evaluating the popularity of a movie, consider:

- The budget of the movie and and how much revenue it made. Don't consider ROI, just consider how large the spend or revenue is.
- The number of votes the movie received and the rating of the movie.
- The production companies of the movie and the quality of the movies they have produced, and how well known the companies are.
- The actors & directors in the movie and how well known they are.

A null value means that the data could not be found or isn't publicly available.

Explain your reasoning, then return the IDs of the most popular movies, in sorted order, in a JSON array.

Include, at most, 15 movies.

Your response should look similar to:
\`\`\`json
[
  123,
  456,
  789
]
\`\`\`
`

  const moviesData = movies.map(function (movie) {
    return _.pick(movie, [
      'id',
      'title',
      'production_companies',
      'release_date',
      'genres',
      'budget',
      'revenue',
      'metacritic_score',
      'imdb_rating',
      'imdb_votes',
      'rt_score',
      'vote_average',
      'vote_count',
      'top_actors',
      'director'
    ])
  })

  const response = await anthropic.prompt(system, JSON.stringify(moviesData))

  const suggestedMovies = _.map(response, id => movies.find(movie => movie.id === id))

  return suggestedMovies
}

const sanatizeForResponse = function (movies) {
  return Promise
    .resolve(movies)
    .map(function (movie) {
      return _.pick(movie, [
        'title',
        'tmdb_id',
        'imdb_id',
        'poster_url'
      ])
    })
}

const filterByMinValue = function (key, value = 0) {
  return function (movies) {
    return _.filter(movies, function (movie) {
      return _.get(movie, key, 0) >= value
    })
  }
}

const filterByMaxValue = function (key, value = 0) {
  return function (movies) {
    return _.filter(movies, function (movie) {
      return _.get(movie, key, 0) <= value
    })
  }
}

const rejectArrayValues = function (key, values) {
  return function (movies) {
    if (_.isNil(values)) {
      return movies
    }

    return _.reject(movies, function (movie) {
      return values.some(value => _.get(movie, key, []).includes(value))
    })
  }
}

const calculateMovieAge = function (movies) {
  return _.map(movies, function (movie) {
    movie.age = moment().diff(movie.release_date, 'days')
    return movie
  })
}

const logger = function (movies) {
  console.table(movies, [
    'id',
    'imdb_id',
    'tmdb_id',
    'title',
    'release_date',
    'age',
    'metacritic_score',
    'imdb_rating',
    'imdb_votes',
    'rt_score',
    'popularity',
    'vote_average',
    'vote_count',
    'genres',
    'budget',
    'revenue',
    'production_companies',
    'top_actors',
    'director',
    'writer'
  ])
}

module.exports = (function () {
  //
  // Class builder functions to help cache content but be
  // able to filter after the fact with options
  //
  let allMovies = null

  const getMovies = function () {
    if (allMovies) {
      return allMovies
    }

    return Promise
      .resolve(tmdb.getMovies())
      .then(calculateMovieAge)
      .then(filterByMaxValue('age', 120))
      .then(filterByMinValue('age', 0))
      .then(getTmdbDetails)
      .then(getMetacriticRatings)
      .then(getOmdbRatings)
      .then(getImdbRatings)
      .tap(logger)
      .tap(function (movies) {
        allMovies = movies
      })
  }

  const ListBuilder = function () {}

  ListBuilder.prototype.filter = function (opts = {}) {
    return Promise
      .resolve(getMovies())
      .then(filterByMinValue('metacritic_score', opts.min_metacritic_score))
      .then(filterByMinValue('rt_score', opts.min_rt_score))
      .then(filterByMinValue('imdb_rating', opts.min_imdb_rating))
      .then(rejectArrayValues('genres', opts.exclude_genres))
      .then(sanatizeForResponse)
  }

  ListBuilder.prototype.evaluate = function () {
    return Promise
      .resolve(getMovies())
      .then(evaluateMovies)
      .then(sanatizeForResponse)
  }

  ListBuilder.prototype.dump = function () {
    return allMovies
  }

  return ListBuilder
})()
