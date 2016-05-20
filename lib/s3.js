const s3 = require('s3');
const config = require('./config');
const Promise = require('bluebird');

const client = s3.createClient({
  s3Options: {
    accessKeyId: config.AWS_KEY,
    secretAccessKey: config.AWS_SECRET,
  },
});

module.exports.uploadJson = (localPath, remotePath) => {
  const params = {
    localFile: localPath,
    s3Params: {
      Bucket: config.AWS_BUCKET,
      Key: remotePath,
      ACL: 'public-read',
    },
    defaultContentType: 'application/json',
  };

  return new Promise((resolve, reject) => {
    const uploader = client.uploadFile(params);

    uploader.on('error', reject);
    uploader.on('end', resolve);
  });
};
