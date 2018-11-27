module.exports = function(s3Bucket, type, imageKey, productImage) {
    if(type === 'add') {
        var data = { Key: imageKey, ContentType: 'image', Body: productImage.data };
        s3Bucket.putObject(data, function (err, data) {
            if (err) return console.log('Error uploading data: ', data);           
        });

    }else {
        s3Bucket.deleteObject({ Key: imageKey },function (err,data){
              if(err) return console.log('Error deleting image');              
          })
    }
}



