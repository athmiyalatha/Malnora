const express = require('express');
const Product = require('../models/product');

const router = express.Router();

// GET all active products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ active: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get products error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

// GET one product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.active) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
});

module.exports = router;