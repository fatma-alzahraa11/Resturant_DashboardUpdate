import User from '../models/User';
import Restaurant from '../models/Restaurant';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateRestaurantCode } from '../utils/restaurantCodeGenerator';
dotenv.config();

// Import JWT and bcrypt with require to avoid TypeScript issues
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15d';

// Validate JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set in environment variables. Using default secret.');
  console.warn('   Please set JWT_SECRET in your .env file for production.');
}

export default {
  // Register a new user
  register: async (req: any, res: any) => {
    try {
      const { email, password, role, permissions, ...rest } = req.body;
      
      // Check if user already exists
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      // Create user with proper role and permissions
      const userData = {
        email,
        password,
        role: role || 'staff',
        permissions: permissions || [],
        ...rest
      };

      const user = new User(userData);
      await user.save();
      
      res.status(201).json({ 
        message: 'User registered successfully', 
        user: { ...user.toObject(), password: undefined } 
      });
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map((error: any) => error.message);
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors 
        });
      }
      
      res.status(400).json({ error: err.message });
    }
  },

  // Register a new restaurant owner with restaurant
  registerRestaurantOwner: async (req: any, res: any) => {
    try {
      const { 
        // User fields
        email, 
        password, 
        firstName, 
        lastName, 
        phone,
        // Restaurant fields
        restaurantName,
        restaurantDescription,
        cuisine,
        address,
        contact,
        logo,
        banner
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      // Calculate dates for subscription
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Generate unique restaurant code
      const restaurantCode = await generateRestaurantCode();

      // Create user first with temporary super_admin role to avoid restaurantId requirement
      const userData = {
        email,
        password,
        firstName,
        lastName,
        phone,
        role: 'super_admin', // Temporary role to avoid restaurantId requirement
        isActive: true,
        emailVerified: false,
        phoneVerified: false
      };

      const user = new User(userData);
      await user.save();

      // Now create restaurant with the user's ID as owner
      const restaurantData = {
        name: restaurantName,
        description: restaurantDescription || '',
        cuisine: Array.isArray(cuisine) ? cuisine.join(', ') : (cuisine || 'عربي'),
        restaurantCode: restaurantCode, // Add the generated restaurant code
        logo: logo || '',
        banner: banner || '',
        ownerId: user._id, // Set the owner ID here
        isActive: true,
        isVerified: false,
        rating: 0,
        totalReviews: 0,
        totalOrders: 0,
        monthlyRevenue: 0,
        // Address with valid coordinates
        address: {
          street: address?.street || 'Default Street',
          city: address?.city || 'Default City',
          state: address?.state || 'Default State',
          country: address?.country || 'Default Country',
          zipCode: address?.zipCode || '00000',
          coordinates: address?.coordinates || [46.6753, 24.7136] // Default coordinates for Riyadh
        },
        // Contact
        contact: {
          phone: contact?.phone || phone || '+1234567890', // Ensure phone is provided
          email: contact?.email || email, // Email should always be available from user registration
          website: contact?.website || ''
        },
        // Social (empty object)
        social: {},
        // Settings with defaults
        settings: {
          theme: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1F2937',
            fontFamily: 'Inter',
            logoPosition: 'left'
          },
          languages: ['en', 'ar'],
          currency: 'USD',
          timezone: 'UTC',
          taxRate: 0,
          serviceCharge: 0,
          autoAcceptOrders: false,
          requireCustomerInfo: true,
          allowTableSelection: true,
          allowDelivery: true,
          allowTakeaway: true,
          maxDeliveryDistance: 10,
          orderPreparationTime: 20
        },
        // Subscription with proper dates
        subscription: {
          plan: 'basic',
          startDate: now,
          endDate: thirtyDaysFromNow,
          features: ['unlimited_products', 'unlimited_orders'],
          monthlyPrice: 29.99,
          isActive: true,
          paymentMethod: 'card',
          nextBillingDate: thirtyDaysFromNow
        }
      };

      const restaurant = new Restaurant(restaurantData);
      await restaurant.save();

      // Update user with restaurant ID and correct role
      user.restaurantId = restaurant._id as mongoose.Types.ObjectId;
      user.role = 'restaurant_owner'; // Set the correct role
      await user.save();

      // Generate JWT token
      const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        storeId: user.storeId,
        permissions: user.permissions
      };

      // const token = jwt.sign(payload, JWT_SECRET, { 
      //   expiresIn: JWT_EXPIRES_IN,
      //   algorithm: 'HS256'
      // });

      res.status(201).json({ 
        message: 'Restaurant owner registered successfully',
        // token,
        user: { ...user.toObject(), password: undefined },
        restaurant: { ...restaurant.toObject() }
      });
    } catch (err: any) {
      console.error('Restaurant owner registration error:', err);
      
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map((error: any) => error.message);
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors 
        });
      }
      
      res.status(500).json({ error: err.message });
    }
  },

  // Login
  login: async (req: any, res: any) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      const user = await User.findOne({ 
        email: email.toLowerCase() 
      }).select('+password');
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          details: 'User not found with this email'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          error: 'Account is deactivated',
          details: 'Please contact administrator'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          details: 'Password is incorrect'
        });
      }

      user.lastLogin = new Date();
      await user.save();

      const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        storeId: user.storeId,
        permissions: user.permissions
      };

      const token = jwt.sign(payload, JWT_SECRET, { 
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256'
      });
      
      res.json({ 
        message: 'Login successful',
        token, 
        user: { ...user.toObject(), password: undefined } 
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get current user
  getMe: async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Not authenticated' });
      
      const dbUser = await User.findById(user.userId);
      if (!dbUser) return res.status(404).json({ error: 'User not found' });
      
      res.json({ ...dbUser.toObject(), password: undefined });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // List all users
  list: async (req: any, res: any) => {
    try {
      const users = await User.find();
      res.json(users.map(u => ({ ...u.toObject(), password: undefined })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get a single user by ID
  get: async (req: any, res: any) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ ...user.toObject(), password: undefined });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Update a user by ID
  update: async (req: any, res: any) => {
    try {
      const { password, ...rest } = req.body;
      let updateData = { ...rest };
      if (password) {
        updateData = { ...updateData, password: await bcrypt.hash(password, 12) };
      }
      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ ...user.toObject(), password: undefined });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Delete a user by ID
  remove: async (req: any, res: any) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Update profile
  updateProfile: async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Not authenticated' });
      const dbUser = await User.findByIdAndUpdate(
        user.userId,
        req.body,
        { new: true, runValidators: true }
      );
      if (!dbUser) return res.status(404).json({ error: 'User not found' });
      res.json({ ...dbUser.toObject(), password: undefined });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Change password
  changePassword: async (req: any, res: any) => {
    try {
      const user = req.user;
      const { oldPassword, newPassword } = req.body;
      if (!user) return res.status(401).json({ error: 'Not authenticated' });
      const dbUser = await User.findById(user.userId).select('+password');
      if (!dbUser) return res.status(404).json({ error: 'User not found' });
      const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
      if (!isMatch) return res.status(400).json({ error: 'Old password is incorrect' });
      dbUser.password = await bcrypt.hash(newPassword, 12);
      await dbUser.save();
      res.json({ message: 'Password changed' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Kitchen staff registration
  registerKitchenStaff: async (req: any, res: any) => {
    try {
      const { 
        email, password, firstName, lastName, phone, 
        restaurantId, storeId, kitchenRole 
      } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      
      // Validate restaurant exists
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      
      const userData = {
        email,
        password,
        firstName,
        lastName,
        phone,
        role: 'staff',
        restaurantId,
        storeId,
        permissions: ['order:read', 'order:write', 'product:read'],
        kitchenRole: kitchenRole || 'cook', // 'cook', 'prep', 'expeditor'
        isActive: true,
        emailVerified: false,
        phoneVerified: false
      };
      
      const user = new User(userData);
      await user.save();
      
      res.status(201).json({ 
        message: 'Kitchen staff registered successfully',
        user: { ...user.toObject(), password: undefined }
      });
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map((error: any) => error.message);
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors 
        });
      }
      res.status(400).json({ error: err.message });
    }
  },

  // Staff registration by restaurant code
  registerStaffByCode: async (req: any, res: any) => {
    try {
      const { 
        email, password, firstName, lastName, phone, 
        restaurantCode, storeId, kitchenRole 
      } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      
      // Find restaurant by code
      const restaurant = await Restaurant.findOne({ 
        restaurantCode: restaurantCode.toUpperCase(),
        isActive: true 
      });
      
      if (!restaurant) {
        return res.status(404).json({ 
          error: 'Restaurant not found',
          message: 'Invalid restaurant code or restaurant is not active'
        });
      }
      
      // Find the first store for this restaurant or create a default one
      let userStoreId = storeId;
      if (!userStoreId) {
        // Check if any store exists for this restaurant
        const Store = mongoose.model('Store');
        const existingStore = await Store.findOne({ restaurantId: restaurant._id });
        
        if (existingStore) {
          userStoreId = existingStore._id;
        } else {
          // Create a default store for the restaurant
          const defaultStore = new Store({
            restaurantId: restaurant._id,
            name: `${restaurant.name} - Main Store`,
            address: restaurant.address,
            contact: restaurant.contact,
            settings: {
              tableCount: 10,
              deliveryRadius: 5,
              deliveryFee: 0,
              minimumOrder: 0,
              openingHours: {
                mon: { open: '09:00', close: '22:00', isOpen: true },
                tue: { open: '09:00', close: '22:00', isOpen: true },
                wed: { open: '09:00', close: '22:00', isOpen: true },
                thu: { open: '09:00', close: '22:00', isOpen: true },
                fri: { open: '09:00', close: '22:00', isOpen: true },
                sat: { open: '09:00', close: '22:00', isOpen: true },
                sun: { open: '09:00', close: '22:00', isOpen: true }
              },
              paymentMethods: ['cash', 'card'],
              onlinePaymentEnabled: true,
              autoAcceptOrders: false,
              preparationTime: 20,
              maxConcurrentOrders: 20
            },
            isActive: true,
            isOpen: true,
            currentOrders: 0,
            totalOrders: 0,
            monthlyRevenue: 0,
            rating: 0,
            totalReviews: 0
          });
          
          await defaultStore.save();
          userStoreId = defaultStore._id;
        }
      }

      const userData = {
        email,
        password,
        firstName,
        lastName,
        phone,
        role: 'staff',
        restaurantId: restaurant._id,
        storeId: userStoreId,
        permissions: ['order:read', 'order:write', 'product:read'],
        kitchenRole: kitchenRole || 'cook',
        isActive: true,
        emailVerified: false,
        phoneVerified: false
      };
      
      const user = new User(userData);
      await user.save();
      
      // Get store information
      const Store = mongoose.model('Store');
      const store = await Store.findById(userStoreId);
      
      res.status(201).json({ 
        message: 'Staff registered successfully',
        user: { ...user.toObject(), password: undefined },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          restaurantCode: restaurant.restaurantCode
        },
        store: {
          id: store._id,
          name: store.name,
          isDefault: store.name.includes('Main Store')
        }
      });
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map((error: any) => error.message);
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors 
        });
      }
      res.status(400).json({ error: err.message });
    }
  },

  logout: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },
  refreshToken: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },
  forgotPassword: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },
  resetPassword: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  }
};
