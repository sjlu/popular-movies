var Promise = require('bluebird')
var AWS = require('aws-sdk')
var config = require('../config')

AWS.config.setPromisesDependency(Promise)

AWS.config.update({
  accessKeyId: config.AWS_KEY,
  secretAccessKey: config.AWS_SECRET,
  region: 'us-east-1'
})

var s3 = new AWS.S3()

module.exports.upload = function (key, data) {
  return s3
    .putObject({
      Bucket: config.AWS_BUCKET,
      Key: key,
      ContentType: 'application/json',
      Body: data,
      ACL: 'public-read'
    })
    .promise()
}
