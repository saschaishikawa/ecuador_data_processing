const mkdirp = require('mkdirp');
const path = require('path');

function downloadFromS3(s3, bucket, key, dest, callback) {
  console.log('downloadFromS3() {bucket: %s, key: %s, dest: %s}', bucket, key, dest); // DEBUG

  // mkdirp(path.dirname(dest), function(err) { // ensure dest dir exists
  //   if(err) throw err;
    var file = require('fs').createWriteStream(dest);
    var req = s3.getObject({ Bucket: bucket, Key: key}); //.createReadStream().pipe(file);
    req.on('httpData', function(chunk) {
      file.write(chunk);
    });
    // TO DO: why doesn't this ever get executed?
    // req.on('httpDone', function(resp) {
    //   console.log('resp: ', JSON.parse(resp.httpResponse.body) );
    //   file.end();
    //   console.log('Finished downloading %s', resp.request.params.Key);
    //   callback(null, resp);
    // }).send();
  // });
}

module.exports = downloadFromS3;
