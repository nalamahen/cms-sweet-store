var mongoose = require('mongoose');

// Brand Image Schema
var BrandImageSchema = mongoose.Schema({
   
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,        
    },  
    image: {
        type: String
    },
    display: { 
        type: Boolean , 
        default: true 
    },
});

var BrandImage = module.exports = mongoose.model('BrandImage', BrandImageSchema);