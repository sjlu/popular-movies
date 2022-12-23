const Promise = require('bluebird')
const AWS = require('aws-sdk')
const zlib = require('zlib')
const config = require('../config')

const gzip = Promise.promisify(zlib.gzip)

AWS.config.setPromisesDependency(Promise)

AWS.config.update({
  accessKeyId: config.AWS_KEY,
  secretAccessKey: config.AWS_SECRET,
  region: 'us-east-1'
})

const s3 = new AWS.S3()

module.exports.upload = async function (key, data) {
  const compressedData = await gzip(data)

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
