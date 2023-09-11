#!/usr/bin/env node
const Promise = require('bluebird')
const moment = require('moment')
const Index = require('../index')
const s3 = require('../lib/s3')
const r2 = require('../lib/r2')
const json2csv = require('../lib/json2csv')
const fs = Promise.promisifyAll(require('fs'))

const build = function (listBuilder, filename, opts = {}) {
  return Promise
    .bind({
      listBuilder,
      filename,
      opts
    })
    .then(function () {
      return this.listBuilder.filter(this.opts)
    })
    .then(function (movies) {
      console.log({
        filename: this.filename,
        opts: this.opts,
        count: movies.length
      })

      const jsonMovies = JSON.stringify(movies)

      return Promise.all([
        s3.upload(this.filename, jsonMovies),
        r2.upload(this.filename, jsonMovies)
      ])
    })
}

Promise
  .bind({
    listBuilder: new Index()
  })
  .then(function () {
    return [
      {
        filename: 'movies.json'
      },
      {
        filename: `movies-${moment().format('YYYYMMDD')}.json`
      },
      {
        filename: 'movies-metacritic-min50.json',
        opts: {
          min_metacritic_score: 50
        }
      },
      {
        filename: 'movies-metacritic-min60.json',
        opts: {
          min_metacritic_score: 60
        }
      },
      {
        filename: 'movies-metacritic-min70.json',
        opts: {
          min_metacritic_score: 70
        }
      },
      {
        filename: 'movies-metacritic-min80.json',
        opts: {
          min_metacritic_score: 80
        }
      },
      {
        filename: 'movies-imdb-min5.json',
        opts: {
          min_imdb_rating: 5
        }
      },
      {
        filename: 'movies-imdb-min6.json',
        opts: {
          min_imdb_rating: 6
        }
      },
      {
        filename: 'movies-imdb-min7.json',
        opts: {
          min_imdb_rating: 7
        }
      },
      {
        filename: 'movies-imdb-min8.json',
        opts: {
          min_imdb_rating: 8
        }
      },
      {
        filename: 'movies-rottentomatoes-min50.json',
        opts: {
          min_rt_score: 50
        }
      },
      {
        filename: 'movies-rottentomatoes-min60.json',
        opts: {
          min_rt_score: 60
        }
      },
      {
        filename: 'movies-rottentomatoes-min70.json',
        opts: {
          min_rt_score: 70
        }
      },
      {
        filename: 'movies-rottentomatoes-min80.json',
        opts: {
          min_rt_score: 80
        }
      }
    ]
  })
  .mapSeries(function (manifest) {
    return build(this.listBuilder, manifest.filename, manifest.opts)
  })
  .then(function () {
    return this.listBuilder.dump()
  })
  .then(function (data) {
    return json2csv(data)
  })
  .then(function (csvData) {
    return fs.writeFileAsync('dump.csv', csvData)
  })
  .then(function () {
    process.exit(0)
  })
  .catch(function (err) {
    console.error(err)
    process.exit(1)
  })
