const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
    title: {type: String, required: true},   
    qty: { type: Number, required: true},
    price: { type: Number, required: true},
    image: {type: String}
});

module.exports = itemSchema;
