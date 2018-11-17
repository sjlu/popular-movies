var Redis = require('ioredis')
var config = require('../config')

var client = new Redis(config.REDIS_URL)

module.exports = client
