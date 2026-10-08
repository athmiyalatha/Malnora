const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/product');

dotenv.config();

const products = [
  {
    name: 'Fresh Red Apples',
    brand: 'Malnora Fresh',
    category: 'Fruits',
    department: 'Groceries',
    price: 149,
    mrp: 180,
    quantity: '1 kg',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
    description: 'Fresh and crunchy red apples, carefully selected for quality.',
    rating: 4.5,
    ratingCount: 120,
    active: true,
  },
  {
    name: 'Fresh Bananas',
    brand: 'Malnora Fresh',
    category: 'Fruits',
    department: 'Groceries',
    price: 59,
    mrp: 70,
    quantity: '1 dozen',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
    description: 'Naturally sweet and fresh bananas.',
    rating: 4.6,
    ratingCount: 95,
    active: true,
  },
  {
    name: 'Fresh Broccoli',
    brand: 'Malnora Fresh',
    category: 'Vegetables',
    department: 'Groceries',
    price: 69,
    mrp: 85,
    quantity: '500 g',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc',
    description: 'Fresh green broccoli packed with nutrients.',
    rating: 4.4,
    ratingCount: 65,
    active: true,
  },
  {
    name: 'Fresh Tomatoes',
    brand: 'Malnora Fresh',
    category: 'Vegetables',
    department: 'Groceries',
    price: 39,
    mrp: 50,
    quantity: '1 kg',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337',
    description: 'Fresh ripe tomatoes perfect for everyday cooking.',
    rating: 4.3,
    ratingCount: 88,
    active: true,
  },
  {
    name: 'Full Cream Milk',
    brand: 'Malnora Dairy',
    category: 'Dairy',
    department: 'Groceries',
    price: 62,
    mrp: 68,
    quantity: '1 litre',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150',
    description: 'Fresh full cream milk for your daily needs.',
    rating: 4.7,
    ratingCount: 150,
    active: true,
  },
  {
    name: 'Premium Basmati Rice',
    brand: 'Malnora Select',
    category: 'Staples',
    department: 'Groceries',
    price: 699,
    mrp: 799,
    quantity: '5 kg',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
    description: 'Long-grain aromatic basmati rice.',
    rating: 4.6,
    ratingCount: 110,
    active: true,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB connected');

    await Product.deleteMany({});

    await Product.insertMany(products);

    console.log(`✅ ${products.length} products added successfully`);

    await mongoose.disconnect();

    console.log('🔌 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Seeding failed');
    console.error(error.message);
    process.exit(1);
  }
};

seedProducts();