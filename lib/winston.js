var winston = require('winston')

winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, {
  colorize: true,
  level: 'info'
})

module.exports = winston
