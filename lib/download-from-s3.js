const path = require('path');

function downloadFromS3(s3, bucket, key, dest, callback) {
  // console.log('downloadFromS3() {bucket: %s, key: %s, dest: %s}', bucket, key, dest); // DEBUG
    var file = require('fs').createWriteStream(dest);
    s3.getObject({ Bucket: bucket, Key: key})
    .on('httpData', function(chunk) {
      file.write(chunk);
    })
    .on('httpDone', function(resp) {
      file.end();
      callback(null, resp);
    }).send();
}

module.exports = downloadFromS3;
