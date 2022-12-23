const Redis = require('ioredis')
const config = require('../config')

const client = new Redis(config.REDIS_URL)

module.exports = client
