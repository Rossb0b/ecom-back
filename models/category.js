const mongoose = require('mongoose');

const Product = require('./product');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }]
});

module.exports = mongoose.model('Category', categorySchema);