const json2csv = require('json2csv')
const _ = require('lodash')

module.exports = function (rows, opts) {
  opts = _.defaults(opts || {}, {
    withBOM: true
  })

  return json2csv.parse(rows, opts)
}
