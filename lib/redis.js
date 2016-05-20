const redis = require('redis');
const uri = require('urijs');
const config = require('./config');
const Promise = require('bluebird');


let client;
if (config.REDISCLOUD_URL) {
  const redisParts = uri(config.REDISCLOUD_URL);
  const hostname = redisParts.hostname();
  const port = redisParts.port();
  const password = redisParts.password();
  client = redis.createClient(port, hostname, {
    auth_pass: password,
  });
} else {
  client = redis.createClient();
}

module.exports = Promise.promisifyAll(client);
