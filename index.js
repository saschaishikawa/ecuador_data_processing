const AWS = require('aws-sdk');
const downloadFromS3 = require('./lib/download-from-s3');
const path = require('path');

const bucket = 'ecuador-earthquake';
const region = 'us-west-1';
const s3 = new AWS.S3({
  region: region,
  endpoint: 's3.amazonaws.com'
});

console.log('Fetching TIL files...');
var key ='post-event/055228066010_01/055228066010_01_P001_MUL/16APR17160138-M1BS-055228066010_01_P001.XML';
var dest = './data/'+path.basename(key);
downloadFromS3(s3, bucket, key, dest, function(err, result) {
  console.log('DONE.', result);
});
