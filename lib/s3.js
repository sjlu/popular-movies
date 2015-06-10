var s3 = require('s3');
var config = require('./config');
var Promise = require('bluebird');

var client = s3.createClient({
  s3Options: {
    accessKeyId: config.AWS_KEY,
    secretAccessKey: config.AWS_SECRET
  }
})

module.exports.uploadJson = function(localPath, remotePath) {

  var params = {
    localFile: localPath,
    s3Params: {
      Bucket: config.AWS_BUCKET,
      Key: remotePath,
      ACL: 'public-read'
    },
    defaultContentType: "application/json"
  }

  return new Promise(function(resolve, reject) {

    var uploader = client.uploadFile(params)

    uploader.on('error', reject)
    uploader.on('end', resolve)

  })

}