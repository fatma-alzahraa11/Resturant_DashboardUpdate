import Discount from '../models/Discount';
import Product from '../models/Product';
import Category from '../models/Category';
import { Request, Response } from 'express';

export default {
  // Create a new discount
  create: async (req: any, res: any) => {
    try {
      const { 
        restaurantId, 
        name, 
        description, 
        code, 
        rule, 
        target, 
        schedule, 
        image, 
        isActive, 
        isPublic, 
        usageLimit, 
        customerUsageLimit, 
        priority, 
        conditions 
      } = req.body;

      // Validate required fields
      if (!restaurantId || !name || !rule || !target || !schedule) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: 'restaurantId, name, rule, target, and schedule are required'
        });
      }

      // Validate rule
      if (!rule.type || rule.value === undefined) {
        return res.status(400).json({ 
          error: 'Invalid rule',
          details: 'Rule must have type and value'
        });
      }

      // Validate target
      if (!target.type) {
        return res.status(400).json({ 
          error: 'Invalid target',
          details: 'Target must have type'
        });
      }

      // Validate schedule
      if (!schedule.startDate || !schedule.endDate) {
        return res.status(400).json({ 
          error: 'Invalid schedule',
          details: 'Schedule must have startDate and endDate'
        });
      }

      // Check if code already exists (if provided)
      if (code) {
        const existingDiscount = await Discount.findOne({ code });
        if (existingDiscount) {
          return res.status(409).json({ 
            error: 'Code already exists',
            details: 'This discount code is already in use'
          });
        }
      }

      // Create discount with proper structure
      const discountData = {
        restaurantId,
        name: {
          en: name.en || name,
          ar: name.ar || name,
          de: name.de || name
        },
        description: {
          en: description?.en || description || '',
          ar: description?.ar || description || '',
          de: description?.de || description || ''
        },
        code: code || undefined,
        rule,
        target,
        schedule: {
          startDate: new Date(schedule.startDate),
          endDate: new Date(schedule.endDate),
          isRecurring: schedule.isRecurring || false
        },
        image: image || '',
        isActive: isActive !== undefined ? isActive : true,
        isPublic: isPublic !== undefined ? isPublic : true,
        usageLimit: usageLimit || null,
        usageCount: 0,
        customerUsageLimit: customerUsageLimit || null,
        customerUsage: [],
        priority: priority || 0,
        conditions: conditions || {},
        usageHistory: []
      };

      const discount = new Discount(discountData);
      await discount.save();

      res.status(201).json({
        message: 'Discount created successfully',
        discount
      });
    } catch (err: any) {
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

  // List discounts with filtering and pagination
  list: async (req: any, res: any) => {
    try {
      const { 
        restaurantId, 
        search, 
        isActive, 
        isPublic,
        ruleType,
        page = 1, 
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter: any = {};
      
      if (restaurantId) filter.restaurantId = restaurantId;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
      if (ruleType) filter['rule.type'] = ruleType;

      // Search functionality
      if (search) {
        filter.$or = [
          { 'name.en': { $regex: search, $options: 'i' } },
          { 'name.ar': { $regex: search, $options: 'i' } },
          { 'name.de': { $regex: search, $options: 'i' } },
          { 'description.en': { $regex: search, $options: 'i' } },
          { 'description.ar': { $regex: search, $options: 'i' } },
          { 'description.de': { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Sorting
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const discounts = await Discount.find(filter)
        .populate('restaurantId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

      const total = await Discount.countDocuments(filter);

      res.json({
        discounts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get discount by ID
  get: async (req: any, res: any) => {
    try {
      const discount = await Discount.findById(req.params.id)
        .populate('restaurantId', 'name');

      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }

      res.json(discount);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Update discount
  update: async (req: any, res: any) => {
    try {
      const { 
        name, 
        description, 
        code, 
        rule, 
        target, 
        schedule, 
        image, 
        isActive, 
        isPublic, 
        usageLimit, 
        customerUsageLimit, 
        priority, 
        conditions 
      } = req.body;

      // Check if code already exists (if changing)
      if (code) {
        const existingDiscount = await Discount.findOne({ 
          code, 
          _id: { $ne: req.params.id } 
        });
        if (existingDiscount) {
          return res.status(409).json({ 
            error: 'Code already exists',
            details: 'This discount code is already in use'
          });
        }
      }

      // Build update object
      const updateData: any = {};
      
      if (name) {
        updateData.name = {
          en: name.en || name,
          ar: name.ar || name,
          de: name.de || name
        };
      }
      
      if (description !== undefined) {
        updateData.description = {
          en: description?.en || description || '',
          ar: description?.ar || description || '',
          de: description?.de || description || ''
        };
      }
      
      if (code !== undefined) updateData.code = code;
      if (rule) updateData.rule = rule;
      if (target) updateData.target = target;
      if (schedule) updateData.schedule = schedule;
      if (image !== undefined) updateData.image = image;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
      if (customerUsageLimit !== undefined) updateData.customerUsageLimit = customerUsageLimit;
      if (priority !== undefined) updateData.priority = priority;
      if (conditions !== undefined) updateData.conditions = conditions;

      const discount = await Discount.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('restaurantId', 'name');

      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }

      res.json({
        message: 'Discount updated successfully',
        discount
      });
    } catch (err: any) {
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

  // Delete discount
  remove: async (req: any, res: any) => {
    try {
      const discount = await Discount.findById(req.params.id);
      
      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }

      await Discount.findByIdAndDelete(req.params.id);

      res.json({ message: 'Discount deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Validate discount code
  validateCode: async (req: any, res: any) => {
    try {
      const { code, customerId, orderItems, orderTotal } = req.body;

      if (!code || !orderItems || orderTotal === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: 'code, orderItems, and orderTotal are required'
        });
      }

      const discount = await Discount.findOne({ code, isActive: true });

      if (!discount) {
        return res.status(404).json({ 
          error: 'Invalid discount code',
          details: 'Discount code not found or inactive'
        });
      }

      // Check if discount is valid
      if (!(discount as any).isValid()) {
        return res.status(400).json({ 
          error: 'Discount not valid',
          details: 'Discount is not currently active or has expired'
        });
      }

      // Check if customer can use this discount
      if (customerId && !(discount as any).canCustomerUse(customerId)) {
        return res.status(400).json({ 
          error: 'Customer cannot use discount',
          details: 'Customer has reached usage limit for this discount'
        });
      }

      // Calculate discount amount
      const discountAmount = (discount as any).calculateDiscount(orderItems, orderTotal);

      if (discountAmount <= 0) {
        return res.status(400).json({ 
          error: 'Discount not applicable',
          details: 'Discount does not apply to this order'
        });
      }

      res.json({
        discount: {
          id: discount._id,
          name: discount.name,
          description: discount.description,
          code: discount.code,
          rule: discount.rule,
          discountAmount,
          isValid: true
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Apply discount to order
  applyToOrder: async (req: any, res: any) => {
    try {
      const { discountId, customerId, orderId, discountAmount } = req.body;

      if (!discountId || !customerId || !orderId || discountAmount === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: 'discountId, customerId, orderId, and discountAmount are required'
        });
      }

      const discount = await Discount.findById(discountId);

      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }

      // Update usage count
      discount.usageCount += 1;

      // Update customer usage
      const customerUsageIndex = discount.customerUsage.findIndex(
        (usage: any) => usage.customerId.toString() === customerId
      );

      if (customerUsageIndex >= 0) {
        discount.customerUsage[customerUsageIndex].usageCount += 1;
        discount.customerUsage[customerUsageIndex].lastUsedAt = new Date();
      } else {
        discount.customerUsage.push({
          customerId,
          usageCount: 1,
          lastUsedAt: new Date()
        });
      }

      // Add to usage history
      discount.usageHistory.push({
        customerId,
        orderId,
        discountAmount,
        usedAt: new Date()
      });

      await discount.save();

      res.json({
        message: 'Discount applied successfully',
        discountAmount,
        updatedDiscount: discount
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get active discounts for restaurant
  getActive: async (req: any, res: any) => {
    try {
      const { restaurantId, customerId } = req.query;

      const filter: any = { 
        restaurantId, 
        isActive: true,
        isPublic: true
      };

      // Add date filter for currently valid discounts
      const now = new Date();
      filter['schedule.startDate'] = { $lte: now };
      filter['schedule.endDate'] = { $gte: now };

      const discounts = await Discount.find(filter)
        .populate('restaurantId', 'name')
        .sort({ priority: -1, createdAt: -1 });

      // Filter discounts that customer can use
      const availableDiscounts = customerId 
        ? discounts.filter(discount => (discount as any).canCustomerUse(customerId))
        : discounts;

      res.json(availableDiscounts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get discount statistics
  getStats: async (req: any, res: any) => {
    try {
      const { restaurantId } = req.query;

      const filter: any = {};
      if (restaurantId) filter.restaurantId = restaurantId;

      const stats = await Discount.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalDiscounts: { $sum: 1 },
            activeDiscounts: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            publicDiscounts: {
              $sum: { $cond: ['$isPublic', 1, 0] }
            },
            totalUsage: { $sum: '$usageCount' },
            totalDiscountAmount: { $sum: '$usageHistory.discountAmount' }
          }
        }
      ]);

      res.json(stats[0] || {
        totalDiscounts: 0,
        activeDiscounts: 0,
        publicDiscounts: 0,
        totalUsage: 0,
        totalDiscountAmount: 0
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}; 