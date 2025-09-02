import { Request, Response } from 'express';
import Offer, { IOffer } from '../models/Offer';
import Product from '../models/Product';

interface OfferQuery {
  restaurantId?: string;
  storeId?: string;
  isAvailable?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export default {
  // Create new offer
  create: async (req: any, res: any) => {
    try {
      const {
        title,
        description,
        image,
        price,
        originalPrice,
        currency = 'EUR',
        products,
        isAvailable = true,
        validFrom,
        validUntil,
        maxRedemptions,
        tags,
        storeId
      } = req.body;

      // Validate required fields
      if (!title || !price || !products || products.length === 0) {
        return res.status(400).json({
          error: 'Title, price, and at least one product are required'
        });
      }

      // Validate products exist
      const productIds = products.map((p: any) => p.productId);
      const existingProducts = await Product.find({
        _id: { $in: productIds },
        restaurantId: req.user.restaurantId
      });

      if (existingProducts.length !== productIds.length) {
        return res.status(400).json({
          error: 'One or more products do not exist or do not belong to your restaurant'
        });
      }

      // Create offer
      const offerData: Partial<IOffer> = {
        restaurantId: req.user.restaurantId,
        storeId: storeId || req.user.storeId,
        title,
        description,
        image,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        currency,
        products: products.map((p: any) => ({
          productId: p.productId,
          quantity: Number(p.quantity),
          unit: p.unit || 'Number'
        })),
        isAvailable,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
        tags: tags || [],
        createdBy: req.user.userId || req.user._id
      };

      const offer = new Offer(offerData);
      await offer.save();
      
      // Populate products for response
      await offer.populate('products.productId', 'name price');
      
      res.status(201).json({
        success: true,
        data: offer,
        message: 'Offer created successfully'
      });
    } catch (error: any) {
      console.error('Create offer error:', error);
      res.status(400).json({
        error: error.message || 'Failed to create offer'
      });
    }
  },

  // Get all offers with filtering and pagination
  list: async (req: any, res: any) => {
    try {
      const {
        isAvailable,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        storeId
      }: OfferQuery = req.query;

      // Build query
      const query: any = {
        restaurantId: req.user.restaurantId
      };

      // Add store filter if provided or user is store-specific
      if (storeId) {
        query.storeId = storeId;
      } else if (req.user.storeId) {
        query.storeId = req.user.storeId;
      }

      // Add availability filter
      if (isAvailable !== undefined) {
        query.isAvailable = String(isAvailable) === 'true';
      }

      // Add search filter
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const skip = (Number(page) - 1) * Number(limit);
      const [offers, total] = await Promise.all([
        Offer.find(query)
          .populate('products.productId', 'name price image')
          .populate('createdBy', 'firstName lastName')
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
        Offer.countDocuments(query)
      ]);

      // Calculate statistics
      const stats = await Offer.aggregate([
        { $match: { restaurantId: req.user.restaurantId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: {
              $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
            },
            totalValue: { $sum: '$price' },
            averagePrice: { $avg: '$price' },
            totalRedemptions: { $sum: '$currentRedemptions' }
          }
        }
      ]);

      res.json({
        success: true,
        data: offers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        statistics: stats[0] || {
          total: 0,
          available: 0,
          totalValue: 0,
          averagePrice: 0,
          totalRedemptions: 0
        }
      });
    } catch (error: any) {
      console.error('List offers error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch offers'
      });
    }
  },

  // Get single offer by ID
  get: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      
      const query: any = {
        _id: id,
        restaurantId: req.user.restaurantId
      };

      // Add store filter if user is store-specific
      if (req.user.storeId) {
        query.storeId = req.user.storeId;
      }

      const offer = await Offer.findOne(query)
        .populate('products.productId', 'name price image description')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName');

      if (!offer) {
        return res.status(404).json({
          error: 'Offer not found'
        });
      }

      res.json({
        success: true,
        data: offer
      });
    } catch (error: any) {
      console.error('Get offer error:', error);
      res.status(400).json({
        error: error.message || 'Failed to fetch offer'
      });
    }
  },

  // Update offer
  update: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Add updatedBy field
      updateData.updatedBy = req.user._id;

      // Validate products if provided
      if (updateData.products && updateData.products.length > 0) {
        const productIds = updateData.products.map((p: any) => p.productId);
        const existingProducts = await Product.find({
          _id: { $in: productIds },
          restaurantId: req.user.restaurantId
        });

        if (existingProducts.length !== productIds.length) {
          return res.status(400).json({
            error: 'One or more products do not exist or do not belong to your restaurant'
          });
        }

        // Format products
        updateData.products = updateData.products.map((p: any) => ({
          productId: p.productId,
          quantity: Number(p.quantity),
          unit: p.unit || 'Number'
        }));
      }

      // Convert numeric fields
      if (updateData.price) updateData.price = Number(updateData.price);
      if (updateData.originalPrice) updateData.originalPrice = Number(updateData.originalPrice);
      if (updateData.maxRedemptions) updateData.maxRedemptions = Number(updateData.maxRedemptions);

      // Convert date fields
      if (updateData.validFrom) updateData.validFrom = new Date(updateData.validFrom);
      if (updateData.validUntil) updateData.validUntil = new Date(updateData.validUntil);

      const query: any = {
        _id: id,
        restaurantId: req.user.restaurantId
      };

      // Add store filter if user is store-specific
      if (req.user.storeId) {
        query.storeId = req.user.storeId;
      }

      const offer = await Offer.findOneAndUpdate(
        query,
        updateData,
        { new: true, runValidators: true }
      ).populate('products.productId', 'name price image');

      if (!offer) {
        return res.status(404).json({
          error: 'Offer not found'
        });
      }

      res.json({
        success: true,
        data: offer,
        message: 'Offer updated successfully'
      });
    } catch (error: any) {
      console.error('Update offer error:', error);
      res.status(400).json({
        error: error.message || 'Failed to update offer'
      });
    }
  },

  // Delete offer
  remove: async (req: any, res: any) => {
    try {
      const { id } = req.params;

      const query: any = {
        _id: id,
        restaurantId: req.user.restaurantId
      };

      // Add store filter if user is store-specific
      if (req.user.storeId) {
        query.storeId = req.user.storeId;
      }

      const offer = await Offer.findOneAndDelete(query);

      if (!offer) {
        return res.status(404).json({
          error: 'Offer not found'
        });
      }

      res.json({
        success: true,
        message: 'Offer deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete offer error:', error);
      res.status(400).json({
        error: error.message || 'Failed to delete offer'
      });
    }
  },

  // Toggle offer availability
  toggleAvailability: async (req: any, res: any) => {
    try {
      const { id } = req.params;

      const query: any = {
        _id: id,
        restaurantId: req.user.restaurantId
      };

      // Add store filter if user is store-specific
      if (req.user.storeId) {
        query.storeId = req.user.storeId;
      }

      const offer = await Offer.findOne(query);

      if (!offer) {
        return res.status(404).json({
          error: 'Offer not found'
        });
      }

      offer.isAvailable = !offer.isAvailable;
      offer.updatedBy = req.user.userId || req.user._id;
      await offer.save();

      res.json({
        success: true,
        data: { isAvailable: offer.isAvailable },
        message: `Offer ${offer.isAvailable ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error: any) {
      console.error('Toggle availability error:', error);
      res.status(400).json({
        error: error.message || 'Failed to toggle offer availability'
      });
    }
  },

  // Get active offers (public endpoint)
  getActiveOffers: async (req: any, res: any) => {
    try {
      const { restaurantId, storeId } = req.params;

      if (!restaurantId) {
        return res.status(400).json({
          error: 'Restaurant ID is required'
        });
      }

      // Build active offers query
      const now = new Date();
      const activeQuery: any = {
        restaurantId,
        isAvailable: true,
        $and: [
          {
            $or: [
              { validFrom: { $exists: false } },
              { validFrom: { $lte: now } }
            ]
          },
          {
            $or: [
              { validUntil: { $exists: false } },
              { validUntil: { $gte: now } }
            ]
          }
        ]
      };
      
      if (storeId) {
        activeQuery.storeId = storeId;
      }
      
      const offers = await Offer.find(activeQuery)
        .populate('products.productId', 'name price')
        .sort({ sortOrder: 1, createdAt: -1 });

      res.json({
        success: true,
        data: offers
      });
    } catch (error: any) {
      console.error('Get active offers error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch active offers'
      });
    }
  },

  // Redeem offer
  redeemOffer: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { customerId } = req.body;

      const offer = await Offer.findById(id);

      if (!offer) {
        return res.status(404).json({
          error: 'Offer not found'
        });
      }

      if (!offer.canRedeem()) {
        return res.status(400).json({
          error: 'Offer cannot be redeemed at this time'
        });
      }

      await offer.redeem();

      res.json({
        success: true,
        data: offer,
        message: 'Offer redeemed successfully'
      });
    } catch (error: any) {
      console.error('Redeem offer error:', error);
      res.status(400).json({
        error: error.message || 'Failed to redeem offer'
      });
    }
  },

  // Get offer statistics
  getStatistics: async (req: any, res: any) => {
    try {
      const query: any = {
        restaurantId: req.user.restaurantId
      };

      // Add store filter if user is store-specific
      if (req.user.storeId) {
        query.storeId = req.user.storeId;
      }

      const stats = await Offer.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalOffers: { $sum: 1 },
            availableOffers: {
              $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
            },
            totalValue: { $sum: '$price' },
            averagePrice: { $avg: '$price' },
            totalRedemptions: { $sum: '$currentRedemptions' },
            totalSavings: {
              $sum: {
                $cond: [
                  { $and: [{ $ne: [{ $type: '$originalPrice' }, 'missing'] }, { $gt: ['$originalPrice', '$price'] }] },
                  { $subtract: ['$originalPrice', '$price'] },
                  0
                ]
              }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalOffers: 0,
        availableOffers: 0,
        totalValue: 0,
        averagePrice: 0,
        totalRedemptions: 0,
        totalSavings: 0
      };

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch statistics'
      });
    }
  }
};
