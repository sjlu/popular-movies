# popular-movies

This tool runs nightly on Heroku's scheduler and updates a list of movies
that it thinks is popular or has been in theaters. It does it's best guess
based on a series of heuristics and sentiment from other websites.

## Develop

* If you want to run it locally you can clone this repository and add a
`.env` file which includes the following lines

    ```
    TMDB_KEY=
    ```

  * https://www.themoviedb.org/documentation/api

* Then run `npm test` and you should see an output of movies showing on
your console and the grade it's gotten.
