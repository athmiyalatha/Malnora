const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: '',
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    mrp: {
      type: Number,
      required: true,
    },

    quantity: {
      type: String,
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default: '',
    },

    description: {
      type: String,
      default: '',
    },

    rating: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);