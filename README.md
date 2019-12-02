# popular-movies

This tool makes a best guess at what popular movies are based on a
series of heuristics from multiple websites. This then returns a
list of movies with their posters and IMDB ID.

Popular movies are based on some general rules:

* Rating greater than the general sentiment of movies currently out
* Released less than a year ago
* At least 3 weeks old to generate a "stable" rating
* Does not consider tastes, categories or genres of movies

## Usage

You can poll the following JSON file for a list of movies.

```
https://s3.amazonaws.com/popular-movies/movies.json
```

  * This file is regenerated nightly so it is recommended that you
    only poll this file once per day
  * It is recommended that you take a snapshot of this list and not
    remove based on the list no longer displaying a particular movie
  * Subject to fair use; excessive usage will be rate limited

There are also several other variations of the main file:

| File | Description |
| -- | -- |
| [movies-metacritic-min50.json](https://s3.amazonaws.com/popular-movies/movies-metacritic-min50.json) | Movies with a minimum score of 50 on Metacritic |
| [movies-metacritic-min60.json](https://s3.amazonaws.com/popular-movies/movies-metacritic-min60.json) | Movies with a minimum score of 60 on Metacritic |
| [movies-metacritic-min70.json](https://s3.amazonaws.com/popular-movies/movies-metacritic-min70.json) | Movies with a minimum score of 70 on Metacritic |
| [movies-metacritic-min80.json](https://s3.amazonaws.com/popular-movies/movies-metacritic-min80.json) | Movies with a minimum score of 80 on Metacritic |
| [movies-imdb-min5.json](https://s3.amazonaws.com/popular-movies/movies-imdb-min5.json) | Movies with a minimum score of 5 on IMDB |
| [movies-imdb-min6.json](https://s3.amazonaws.com/popular-movies/movies-imdb-min6.json) | Movies with a minimum score of 6 on IMDB |
| [movies-imdb-min7.json](https://s3.amazonaws.com/popular-movies/movies-imdb-min7.json) | Movies with a minimum score of 7 on IMDB |
| [movies-imdb-min8.json](https://s3.amazonaws.com/popular-movies/movies-imdb-min8.json) | Movies with a minimum score of 8 on IMDB |
| [movies-rottentomatoes-min50.json](https://s3.amazonaws.com/popular-movies/movies-rottentomatoes-min50.json) | Movies with a minimum score of 50 on Rotten Tomatoes |
| [movies-rottentomatoes-min60.json](https://s3.amazonaws.com/popular-movies/movies-rottentomatoes-min60.json) | Movies with a minimum score of 60 on Rotten Tomatoes |
| [movies-rottentomatoes-min70.json](https://s3.amazonaws.com/popular-movies/movies-rottentomatoes-min70.json) | Movies with a minimum score of 70 on Rotten Tomatoes |
| [movies-rottentomatoes-min80.json](https://s3.amazonaws.com/popular-movies/movies-rottentomatoes-min80.json) | Movies with a minimum score of 80 on Rotten Tomatoes |

If you're looking for historical files, you can amend a date to the
main file like so:

```
https://s3.amazonaws.com/popular-movies/movies-20191202.json
```

_This file is only available from December 2, 2019 onwards._

## Develop

* Make sure you are running Node.js and a local instance of Redis

* If you want to run it locally you can clone this repository and add a
  `.env` file which includes the following lines

    ```
    TMDB_KEY=
    ```

  * https://www.themoviedb.org/documentation/api

* Then run `npm test` and you should see an output of movies showing on
  your console and the grade it's gotten

## License

MIT
