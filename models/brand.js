var mongoose = require('mongoose');

// Brand Schema
var BrandSchema = mongoose.Schema({
   
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String
    }    
});

var Brand = module.exports = mongoose.model('Brand', BrandSchema);