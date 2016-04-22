/* DESCRIPTION:
 * Downloads all available TIL files, checks upper-left coordinate to see if it lies within AOI
 * If inside AOI, the corresponding TIF file will be downloaded
 */

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


/* ROUGH AOI (BOUNDING BOX) */
var lr_x = -79.15512760846489;
var lr_y = -1.526809919837065;

var ur_x = -79.15512760846489;
var ur_y = 0.8982400203432694;

var ul_x = -81.07410268303428;
var ul_y = 0.8982400203432694;

var ll_x = -81.07410268303428;
var ll_y = -1.526809919837065;


getXMLFileList( function(err, list) {

  async.mapSeries(list, function(file, callback) {
    var key = file.Prefix;
    console.log('Downloading TIL file %s', key);
    downloadFromS3(s3, bucket, key, `./data/${path.basename(key)}`, function(err, result) {

        var tokenizedData = result.httpResponse.body.toString().replace(/\t/g,'').replace(/;/g, '').replace(/ /g,'').split(/\r?\n/);
        var data = {};
        for(var field of tokenizedData) {
          data[field.split('=')[0]] = field.split('=')[1];
        }

        // check if "upper-left" point lies within AOI
        var y = data.ULLat;
        var x = data.ULLon;
        if( y <= ur_y && y >= lr_y ) {
          if( x <= ur_x && x >= ul_x ) {
            console.log('Found image within AOI: %s', key);
            console.log('Downloading corresponding GeoTIF file...', `${path.dirname(key)}/${path.basename(key,'.TIL')}.TIF`);
            downloadFromS3(s3, bucket, `${path.dirname(key)}/${path.basename(key,'.TIL')}.TIF`, `./data/${path.basename(key,'.TIL')}.TIF`, function(err, result) {
              if(err) throw err;
              console.log('Finished downloading file %s', key);
            });

          }
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
    Prefix: 'post-event', // Note: change to 'pre-event' to retrieve images from before the quake
    Delimiter: '.TIL'
  }
  s3.listObjects( params, function(err, data) {
    if(err) throw err;
    console.log('Finished retrieving TIL file list.');
    callback(null, data.CommonPrefixes);
  });
}
