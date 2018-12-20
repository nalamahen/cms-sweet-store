var mongoose = require('mongoose');

// User Schema
var UserSchema = mongoose.Schema({
   
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    address_line1: {
        type: String
    },
    city: {
        type: String
    },
    county: {
        type: String
    },
    postcode: {
        type: String
    },
    country: {
        type: String
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Number
    },
    discount_code: {
        type: [String],
        trim: true
    }
    
});

var User = module.exports = mongoose.model('User', UserSchema);

