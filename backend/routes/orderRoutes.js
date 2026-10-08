const express = require('express');
const Order = require('../models/order');

const router = express.Router();

// CREATE ORDER
router.post('/', async (req, res) => {
  try {
    const {
      orderNumber,
      items,
      deliveryAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      total,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required',
      });
    }

    const order = await Order.create({
      orderNumber,
      items,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      subtotal,
      deliveryFee,
      total,
      status: 'confirmed',
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
});

// GET ALL ORDERS
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
});

// GET ONE ORDER
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
});

// UPDATE ORDER STATUS
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'confirmed',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
});

module.exports = router;