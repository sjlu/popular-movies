# popular-movies

Tries to create a list of popular movies based on a series of heuristics

## How it runs

Heroku's scheduler runs `bin/run` once a day which updates the S3 bucket.

## Develop

* Clone
* Make sure to have Redis up and running
* Copy `.env.sample` to `.env` and fill in correct values
* `npm install`
* `npm test`

## Redis

### On Mac

```bash
brew install redis
redis-server /usr/local/etc/redis.conf
```

## License

MIT
