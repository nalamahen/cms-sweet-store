const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemSchema = new Schema({
  title: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  vat: { type: Boolean, required: true, default: true },
  product_code: { type: String }
});

module.exports = itemSchema;
