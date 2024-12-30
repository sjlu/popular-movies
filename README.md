# popular-movies

Popular Movies uses LLMs to evaluate the popularity of movies that are released
and are less than 4 months old. Popular Movies considers a multitude of data points
such as ratings, popularity, production companies, actors, and more.

## Usage

> :warning: **The URL has changed from `https://s3.amazonaws.com/popular-movies/` to `https://popular-movies-data.stevenlu.com/` as of September 11, 2023.**
> Access via S3 using TLS 1.0 or 1.1 will be [deprecated by AWS](https://aws.amazon.com/blogs/security/tls-1-2-required-for-aws-endpoints/) on December 31, 2023.
> Access via S3 will be completely deprecated January 1, 2025.

You can poll the following JSON file for a list of movies.

```
https://popular-movies-data.stevenlu.com/movies.json
```

  * This file is regenerated nightly so it is recommended that you
    only poll this file once per day
  * It is recommended that you take a snapshot of this list and not
    remove based on the list no longer displaying a particular movie
  * Subject to fair use; excessive usage will be rate limited

If you're looking for historical files, you can amend a date to the
main file like so:

```
https://popular-movies-data.stevenlu.com/movies-20191202.json
```

_This file is only available from December 2, 2019 onwards._

## All Movies

There is also a file that includes all movies. This file is not filtered or evaluated.

```
https://popular-movies-data.stevenlu.com/all-movies.json
```

There are also several variations of this file that are filtered by different
rating websites.

| File | Description |
| -- | -- |
| [movies-metacritic-min50.json](https://popular-movies-data.stevenlu.com/movies-metacritic-min50.json) | Movies with a minimum score of 50 on Metacritic |
| [movies-metacritic-min60.json](https://popular-movies-data.stevenlu.com/movies-metacritic-min60.json) | Movies with a minimum score of 60 on Metacritic |
| [movies-metacritic-min70.json](https://popular-movies-data.stevenlu.com/movies-metacritic-min70.json) | Movies with a minimum score of 70 on Metacritic |
| [movies-metacritic-min80.json](https://popular-movies-data.stevenlu.com/movies-metacritic-min80.json) | Movies with a minimum score of 80 on Metacritic |
| [movies-imdb-min5.json](https://popular-movies-data.stevenlu.com/movies-imdb-min5.json) | Movies with a minimum score of 5 on IMDB |
| [movies-imdb-min6.json](https://popular-movies-data.stevenlu.com/movies-imdb-min6.json) | Movies with a minimum score of 6 on IMDB |
| [movies-imdb-min7.json](https://popular-movies-data.stevenlu.com/movies-imdb-min7.json) | Movies with a minimum score of 7 on IMDB |
| [movies-imdb-min8.json](https://popular-movies-data.stevenlu.com/movies-imdb-min8.json) | Movies with a minimum score of 8 on IMDB |
| [movies-rottentomatoes-min50.json](https://popular-movies-data.stevenlu.com/movies-rottentomatoes-min50.json) | Movies with a minimum score of 50 on Rotten Tomatoes |
| [movies-rottentomatoes-min60.json](https://popular-movies-data.stevenlu.com/movies-rottentomatoes-min60.json) | Movies with a minimum score of 60 on Rotten Tomatoes |
| [movies-rottentomatoes-min70.json](https://popular-movies-data.stevenlu.com/movies-rottentomatoes-min70.json) | Movies with a minimum score of 70 on Rotten Tomatoes |
| [movies-rottentomatoes-min80.json](https://popular-movies-data.stevenlu.com/movies-rottentomatoes-min80.json) | Movies with a minimum score of 80 on Rotten Tomatoes |


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
