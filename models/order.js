const mongoose = require('mongoose');
const ItemSchema = require('./item');

const OrderSchema = new mongoose.Schema({
    orderNo: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    items: [ItemSchema],   
    paid: {type: Boolean, default: false},
    date: {type: Date, default: Date.now}
});


const Order = module.exports = mongoose.model('Order', OrderSchema);