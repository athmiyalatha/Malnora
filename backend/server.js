const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const ProductRoutes = require('./routes/productRoutes');
const OrderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', ProductRoutes);
app.use('/api/orders', OrderRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Malnora Backend is running 🚀',
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Malnora API is working!',
  });
});

// Connect MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');

    app.listen(PORT, () => {
      console.log(
        `🚀 Malnora backend running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed');
    console.error(error.message);
  });