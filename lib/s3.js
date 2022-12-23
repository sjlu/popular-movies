var Promise = require('bluebird')
var AWS = require('aws-sdk')
var zlib = require('zlib')
var config = require('../config')

var gzip = Promise.promisify(zlib.gzip)

AWS.config.setPromisesDependency(Promise)

AWS.config.update({
  accessKeyId: config.AWS_KEY,
  secretAccessKey: config.AWS_SECRET,
  region: 'us-east-1'
})

var s3 = new AWS.S3()

module.exports.upload = async function (key, data) {
  var compressedData = await gzip(data)

  await s3
    .putObject({
      Bucket: config.AWS_BUCKET,
      Key: key,
      ContentType: 'application/json',
      Body: compressedData,
      ACL: 'public-read',
      ContentEncoding: 'gzip'
    })
    .promise()
}
