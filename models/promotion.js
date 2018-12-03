const mongoose = require('mongoose');

const PromotionSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: String,
    image: String,
    display: { type: Boolean , default: true },
    dateCreated: {type: Date, default: Date.now}
});


const Promotion = module.exports = mongoose.model('Promotion', PromotionSchema);