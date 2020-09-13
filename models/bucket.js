const mongoose = require('mongoose');

const User = require('./user');
const Product = require('./product');

const bucketSchema = mongoose.Schema({
  products: [{
    product: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      }
    },
    volume: {
      type: Number,
      required: true,
    },
  }],
  price: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Bucket', bucketSchema);