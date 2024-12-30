## 2024-12-30

* MAJOR: Using Anthropic Claude 3.5 Sonnet for evaluation on main recommendation file. The original file is now `all-movies.json`.
* Swapped out Metacritic in favor of TMDB for the main source of movies.
* Fixed an issue where Metacritic ratings were not being pulled correctly from OMDB.

## 2023-09-11

* Moving to Cloudflare R2 for hosting.
* Changed hosted domain to popular-movies-data.stevenlu.com.

## 2022-12-23

* Beginning Dec. 12, 2023, generated JSON files on AWS now use gzip compression.
* Move generator from Heroku to GitHub Actions.
* Set minimum popularity to 30 (from 10).
* Get IMDB ratings directly from IMDB as a fallback.
* Adding additional tests for future proofing.
