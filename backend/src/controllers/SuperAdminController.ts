import Restaurant from '../models/Restaurant';
import User from '../models/User';
import mongoose from 'mongoose';

export default {
  // List all restaurants (for super admin)
  listRestaurants: async (req: any, res: any) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        isActive, 
        isVerified,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { cuisine: { $regex: search, $options: 'i' } },
          { 'address.city': { $regex: search, $options: 'i' } }
        ];
      }
      
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

      // Pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Sorting
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const restaurants = await Restaurant.find(filter)
        .populate('ownerId', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean();

      const total = await Restaurant.countDocuments(filter);

      res.json({
        restaurants,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (err: any) {
      console.error('Super admin list restaurants error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Create restaurant (for super admin)
  createRestaurant: async (req: any, res: any) => {
    const session = await Restaurant.startSession();
    session.startTransaction();
    
    try {
      const { 
        name,
        description,
        cuisine,
        address,
        contact,
        logo,
        banner,
        ownerId, // Optional: existing user ID to assign as owner
        settings,
        subscription
      } = req.body;

      // Calculate dates for subscription
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Create restaurant data
      const restaurantData = {
        name,
        description: description || '',
        cuisine: Array.isArray(cuisine) ? cuisine.join(', ') : (cuisine || 'عربي'),
        logo: logo || '',
        banner: banner || '',
        ownerId: ownerId || null, // Can be null if no owner assigned
        isActive: true,
        isVerified: false,
        rating: 0,
        totalReviews: 0,
        totalOrders: 0,
        monthlyRevenue: 0,
        address: {
          street: address?.street || '',
          city: address?.city || '',
          state: address?.state || '',
          country: address?.country || '',
          zipCode: address?.zipCode || '',
          coordinates: address?.coordinates || [46.6753, 24.7136]
        },
        contact: {
          phone: contact?.phone || '',
          email: contact?.email || '',
          website: contact?.website || ''
        },
        social: {},
        settings: settings || {
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
        subscription: subscription || {
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
      await restaurant.save({ session });

      // If ownerId is provided, update the user's restaurantId
      if (ownerId) {
        const user = await User.findById(ownerId);
        if (user) {
          user.restaurantId = restaurant._id as mongoose.Types.ObjectId;
          user.role = 'restaurant_owner';
          await user.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();

      const populatedRestaurant = await Restaurant.findById(restaurant._id)
        .populate('ownerId', 'firstName lastName email')
        .lean();

      res.status(201).json({
        message: 'Restaurant created successfully',
        restaurant: populatedRestaurant
      });
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      
      console.error('Super admin create restaurant error:', err);
      
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

  // Update restaurant (for super admin)
  updateRestaurant: async (req: any, res: any) => {
    try {
      const { restaurantId } = req.params;
      const updateData = req.body;

      const restaurant = await Restaurant.findByIdAndUpdate(
        restaurantId,
        updateData,
        { new: true, runValidators: true }
      ).populate('ownerId', 'firstName lastName email');

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json({
        message: 'Restaurant updated successfully',
        restaurant
      });
    } catch (err: any) {
      console.error('Super admin update restaurant error:', err);
      
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

  // Delete restaurant (for super admin)
  deleteRestaurant: async (req: any, res: any) => {
    const session = await Restaurant.startSession();
    session.startTransaction();
    
    try {
      const { restaurantId } = req.params;

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Remove restaurantId from associated users
      await User.updateMany(
        { restaurantId: restaurant._id },
        { $unset: { restaurantId: 1 }, role: 'staff' },
        { session }
      );

      // Delete the restaurant
      await Restaurant.findByIdAndDelete(restaurantId, { session });

      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'Restaurant deleted successfully' });
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      
      console.error('Super admin delete restaurant error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get restaurant statistics (for super admin)
  getRestaurantStats: async (req: any, res: any) => {
    try {
      const stats = await Restaurant.aggregate([
        {
          $group: {
            _id: null,
            totalRestaurants: { $sum: 1 },
            activeRestaurants: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            verifiedRestaurants: {
              $sum: { $cond: ['$isVerified', 1, 0] }
            },
            totalOrders: { $sum: '$totalOrders' },
            totalRevenue: { $sum: '$monthlyRevenue' },
            averageRating: { $avg: '$rating' }
          }
        }
      ]);

      res.json(stats[0] || {
        totalRestaurants: 0,
        activeRestaurants: 0,
        verifiedRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageRating: 0
      });
    } catch (err: any) {
      console.error('Super admin restaurant stats error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Assign owner to restaurant (for super admin)
  assignOwner: async (req: any, res: any) => {
    const session = await Restaurant.startSession();
    session.startTransaction();
    
    try {
      const { restaurantId } = req.params;
      const { userId } = req.body;

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const user = await User.findById(userId);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: 'User not found' });
      }

      // Update restaurant with new owner
      restaurant.ownerId = user._id as mongoose.Types.ObjectId;
      await restaurant.save({ session });

      // Update user with restaurant and role
      user.restaurantId = restaurant._id as mongoose.Types.ObjectId;
      user.role = 'restaurant_owner';
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      const updatedRestaurant = await Restaurant.findById(restaurantId)
        .populate('ownerId', 'firstName lastName email')
        .lean();

      res.json({
        message: 'Owner assigned successfully',
        restaurant: updatedRestaurant
      });
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      
      console.error('Super admin assign owner error:', err);
      res.status(500).json({ error: err.message });
    }
  }
}; 