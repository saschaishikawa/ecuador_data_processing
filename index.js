const AWS = require('aws-sdk');
const downloadFromS3 = require('./lib/download-from-s3');
const path = require('path');
const fs = require('fs');
// const readline = require('linebyline');
const async = require('async');

const bucket = 'ecuador-earthquake';
const region = 'us-west-1';
const s3 = new AWS.S3({
  region: region,
  endpoint: 's3.amazonaws.com'
});

//
// var rl = readline('./file_manifest.txt'),
//     downloadList = [];
// rl.on('line', function(line, lineCount, byteCount) {
//   var file = require('fs').createWriteStream(dest);
//   s3.getObject({ Bucket: bucket, Key: line}).createReadStream().pipe(file);
// })
// .on('error', function(e) {
//   // something went wrong
// });

// /* COMMENT FOR NOW */
// console.log('Fetching TIL files...');
// var key ='post-event/055228066010_01/055228066010_01_P001_MUL/16APR17160138-M1BS-055228066010_01_P001.XML';
// var dest = './data/'+path.basename(key);
// downloadFromS3(s3, bucket, key, dest, function(err, result) {
//   console.log('DONE.', result);
// });

/* ROUGH AOI */
ll_lat = 1.476725;  // 1°28'36.21"S
ll_lon = 80.871139; // 80°52'16.10"W

ul_lat = 0.984122;  // 0°59'2.84"N
ul_lon = 81.404308; // 81°24'15.51"W

ur_lat = 1.049642;  // 1° 2'58.71"N
ur_lon = 79.247589; // 79°14'51.32"W

lr_lat = 1.457114;  // 1°27'25.61"S
lr_lon = 79.419639; // 79°25'10.70"W


getXMLFileList( function(err, list) {
  async.mapSeries(list, function(file, callback) {
    var key = file.Prefix;
    console.log('Downloading TIL file ', key);
    downloadFromS3(s3, bucket, key, `./data/${path.basename(key)}`, function(err, result) {

        var tokenizedData = result.httpResponse.body.toString().replace(/\t/g,'').replace(/;/g, '').replace(/ /g,'').split(/\r?\n/);
        var data = {};
        for(var field of tokenizedData) {
          data[field.split('=')[0]] = field.split('=')[1];
        }
        // console.log('data.LLLat = ', data.LLLat);
        // I THINK THIS IS INCCORRECT
        if(data.LLLon < ll_lon && data.LRLlon > lr_lon && data.ULLat < ul_lat && data.LLLat > ll_lat) {
          console.log('DATA IS WITHIN AOI: ', data);
        }

        callback(err, data);
    });
  }, function() {
    console.log('DONE');
  });
});


function getXMLFileList(callback) {
  var params = {
    Bucket: bucket,
    EncodingType: 'url',
    Prefix: 'pre-event',
    Delimiter: '.TIL'
  }
  s3.listObjects( params, function(err, data) {
    if(err) throw err;
    console.log('Finished retrieving TIL file list.');
    callback(null, data.CommonPrefixes);
  });
}
