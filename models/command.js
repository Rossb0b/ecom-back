const mongoose = require('mongoose');

const User = require('./user');
const Bucket = require('./bucket');

const commandSchema = mongoose.Schema({
  clientInformation: {
    billingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  bucketInformation: {
    products: [{
      productId: String,
      name: String,
      price: Number,
      volume: Number
    }],
    price: Number,
  },
  created_date: {
    type: String,
    required: true,
    default: Date.now,
  }
});

module.exports = mongoose.model('Command', commandSchema);