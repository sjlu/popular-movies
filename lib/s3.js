const Promise = require('bluebird')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const zlib = require('zlib')
const config = require('../config')

const gzip = Promise.promisify(zlib.gzip)

// No need to set Promise dependency in v3; native promises are used.

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: config.AWS_KEY,
    secretAccessKey: config.AWS_SECRET
  }
})

module.exports.upload = async function (key, data) {
  const compressedData = await gzip(data)

  await s3.send(new PutObjectCommand({
    Bucket: config.AWS_BUCKET,
    Key: key,
    ContentType: 'application/json',
    Body: compressedData,
    ACL: 'public-read',
    ContentEncoding: 'gzip',
    CacheControl: 'max-age=43200'
  }))
}
