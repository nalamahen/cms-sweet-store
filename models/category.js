var mongoose = require('mongoose');

// Category schema
var CategorySchema = mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    slug: {
        type: String
    }
});

var Category = module.exports = mongoose.model('Category', CategorySchema);