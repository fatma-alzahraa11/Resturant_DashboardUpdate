import Restaurant from '../models/Restaurant';
import { generateRestaurantCode } from '../utils/restaurantCodeGenerator';

export default {
  create: async (req: any, res: any) => {
    try {
      // Get user from request (set by auth middleware)
      const user = req.user;
      
      // Calculate dates
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // Generate unique restaurant code
      const restaurantCode = await generateRestaurantCode();
      
      // Prepare restaurant data with defaults
      const restaurantData = {
        name: req.body.name,
        description: req.body.description,
        cuisine: Array.isArray(req.body.cuisine) ? req.body.cuisine.join(', ') : (req.body.cuisine || 'عربي'),
        restaurantCode: restaurantCode, // Add unique restaurant code
        logo: req.body.logo || '',
        banner: req.body.banner || '',
        ownerId: user.userId,
        isActive: true,
        isVerified: false,
        rating: 0,
        totalReviews: 0,
        totalOrders: 0,
        monthlyRevenue: 0,
        // Address with valid coordinates
        address: {
          street: req.body.address?.street || '',
          city: req.body.address?.city || '',
          state: req.body.address?.state || '',
          country: req.body.address?.country || '',
          zipCode: req.body.address?.zipCode || '',
          coordinates: [46.6753, 24.7136] // Default coordinates for Riyadh
        },
        // Contact
        contact: {
          phone: req.body.contact?.phone || '',
          email: req.body.contact?.email || '',
          website: req.body.contact?.website || ''
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
      res.status(201).json(restaurant);
    } catch (err: any) {
      console.error('Restaurant creation error:', err);
      res.status(400).json({ error: err.message });
    }
  },

  list: async (req: any, res: any) => {
    try {
      const restaurants = await Restaurant.find();
      res.json(restaurants);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  get: async (req: any, res: any) => {
    try {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
      res.json(restaurant);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Get restaurant by code (for staff access)
  getByCode: async (req: any, res: any) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        return res.status(400).json({ error: 'Restaurant code is required' });
      }

      const restaurant = await Restaurant.findOne({ 
        restaurantCode: code.toUpperCase(),
        isActive: true 
      });

      if (!restaurant) {
        return res.status(404).json({ 
          error: 'Restaurant not found or inactive',
          message: 'Invalid restaurant code or restaurant is not active'
        });
      }

      // Return basic restaurant info for staff access
      res.json({
        id: restaurant._id,
        name: restaurant.name,
        restaurantCode: restaurant.restaurantCode,
        isActive: restaurant.isActive,
        isVerified: restaurant.isVerified,
        address: restaurant.address,
        contact: restaurant.contact
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Validate restaurant code
  validateCode: async (req: any, res: any) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        return res.status(400).json({ error: 'Restaurant code is required' });
      }

      const restaurant = await Restaurant.findOne({ 
        restaurantCode: code.toUpperCase(),
        isActive: true 
      });

      if (!restaurant) {
        return res.status(404).json({ 
          valid: false,
          error: 'Invalid restaurant code',
          message: 'Restaurant code not found or restaurant is not active'
        });
      }

      res.json({
        valid: true,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          restaurantCode: restaurant.restaurantCode,
          isVerified: restaurant.isVerified
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get restaurant code for owner
  getRestaurantCode: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Check if user is the owner or super admin
      if (restaurant.ownerId.toString() !== user.userId && user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Access denied. Only restaurant owner can view the code.' });
      }

      res.json({
        restaurantCode: restaurant.restaurantCode,
        restaurantName: restaurant.name,
        message: 'Restaurant code retrieved successfully'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req: any, res: any) => {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
      res.json(restaurant);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  remove: async (req: any, res: any) => {
    try {
      const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
      res.json({ message: 'Restaurant deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  analytics: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },

  updateSettings: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  }
}; 