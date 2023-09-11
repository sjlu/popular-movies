const Promise = require('bluebird')
const AWS = require('aws-sdk')
const zlib = require('zlib')
const config = require('../config')

const gzip = Promise.promisify(zlib.gzip)

AWS.config.setPromisesDependency(Promise)

const s3 = new AWS.S3({
  endpoint: `https://${config.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: config.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: config.CLOUDFLARE_SECRET_ACCESS_KEY,
  signatureVersion: 'v4'
})

// module.exports = s3

module.exports.upload = async function (key, data) {
  const compressedData = await gzip(data)

  await s3
    .putObject({
      Bucket: config.CLOUDFLARE_BUCKET,
      Key: key,
      ContentType: 'application/json',
      Body: compressedData,
      ACL: 'public-read',
      ContentEncoding: 'gzip',
      CacheControl: 'max-age=43200'
    })
    .promise()
}
