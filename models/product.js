var mongoose = require('mongoose');

// Product Schema
var ProductSchema = mongoose.Schema({
   
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    instock: {
        type: Boolean        
    },
    vat: {
        type: Boolean
    },
    product_code: {
        type: String
    }, 
    featured: {
        type: Boolean
    }    
    
});

var Product = module.exports = mongoose.model('Product', ProductSchema);

