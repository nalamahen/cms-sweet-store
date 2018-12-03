const keys = require('./keys');
const AWS = require('aws-sdk');

module.exports = function(bucket){

    AWS.config.accessKeyId = keys.accessKeyId;
    AWS.config.secretAccessKey = keys.secretAccessKey;
    AWS.config.region = keys.region;

    const s3Bucket = new AWS.S3({params: {Bucket: bucket}}); 
    
    return s3Bucket;
}