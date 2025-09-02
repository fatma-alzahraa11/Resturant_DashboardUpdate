import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import connectDB from './config/database';
import errorHandler from './middleware/errorHandler';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import restaurantRoutes from './routes/restaurants';
import storeRoutes from './routes/stores';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import customerRoutes from './routes/customers';
import paymentRoutes from './routes/payments';
import feedbackRoutes from './routes/feedback';
import discountRoutes from './routes/discounts';
import publicRoutes from './routes/public';
import tableRoutes from './routes/tables';
import offerRoutes from './routes/offers';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/offers', offerRoutes);

// Public routes (no authentication required)
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/api/health', async (req: any, res: any): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      res.status(500).json({ status: 'error', db: 'disconnected' });
      return;
    }
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'ok', db: 'connected' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// API documentation endpoint
app.get('/api', (req: any, res: any) => {
  res.json({
    message: 'Restaurant Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      restaurants: '/api/restaurants',
      stores: '/api/stores',
      categories: '/api/categories',
      products: '/api/products',
      orders: '/api/orders',
      customers: '/api/customers',
      payments: '/api/payments',
      feedback: '/api/feedback',
      discounts: '/api/discounts',
      tables: '/api/tables',
      offers: '/api/offers',
      public: '/api/public'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
