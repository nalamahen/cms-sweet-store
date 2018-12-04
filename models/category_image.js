var mongoose = require('mongoose');

// Brand Image Schema
var CategoryImageSchema = mongoose.Schema({
   
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

var CategoryImage = module.exports = mongoose.model('CategoryImage', CategoryImageSchema);