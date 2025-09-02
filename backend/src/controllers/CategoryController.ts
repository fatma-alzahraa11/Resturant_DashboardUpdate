import Category from '../models/Category';
import Product from '../models/Product';

export default {
  // Create a new category
  create: async (req: any, res: any | any) => {
    try {
      const { name, description, image, icon, sortOrder, isActive, isFeatured } = req.body;
      const restaurantId = req.user?.restaurantId || req.body.restaurantId;

      // Validate required fields
      if (!restaurantId || !name) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'restaurantId and name are required'
        });
      }

      // Create category with proper structure
      // const categoryData = {
      //   restaurantId,
      //   name: {
      //     en: name.en || name,
      //     ar: name.ar || name,
      //     de: name.de || name
      //   },
      //   description: {
      //     en: description?.en || description || '',
      //     ar: description?.ar || description || '',
      //     de: description?.de || description || ''
      //   },
      //   image: image || '',
      //   icon: icon || '',
      //   sortOrder: sortOrder || 0,
      //   isActive: isActive !== undefined ? isActive : true,
      //   isFeatured: isFeatured || false,
      //   productCount: 0
      // };
      const categoryData = {
        restaurantId,
        name: {
          en: name.en || name
        
        },
      };

      const category = new Category(categoryData);
      await category.save();

      res.status(201).json({
        message: 'Category created successfully',
        category
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

  // List categories with filtering and pagination
  list: async (req: any, res: any) => {
    try {
      const {
        restaurantId,
        search,
        isActive,
        isFeatured,
        page = 1,
        limit = 20,
        sortBy = 'sortOrder',
        sortOrder = 'asc'
      } = req.query;

      // Build filter object
      const filter: any = {};

      const effectiveRestaurantId = req.user?.restaurantId || restaurantId;
      if (effectiveRestaurantId) filter.restaurantId = effectiveRestaurantId;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

      // Search functionality
      if (search) {
        filter.$or = [
          { 'name.en': { $regex: search, $options: 'i' } },
          { 'name.ar': { $regex: search, $options: 'i' } },
          { 'name.de': { $regex: search, $options: 'i' } },
          { 'description.en': { $regex: search, $options: 'i' } },
          { 'description.ar': { $regex: search, $options: 'i' } },
          { 'description.de': { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination
      const skip = (Number(page) - 1) * Number(limit);

      // Sorting
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const categories = await Category.find(filter)
        .populate('restaurantId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(); // Convert to plain objects to avoid mongoose document issues

      const total = await Category.countDocuments(filter);

      res.json({
        categories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (err: any) {
      console.error('Category list error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get category by ID
  get: async (req: any, res: any | any) => {
    try {
      const category = await Category.findById(req.params.id)
        .populate('restaurantId', 'name')
        .lean();

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(category);
    } catch (err: any) {
      console.error('Category get error:', err);
      res.status(400).json({ error: err.message });
    }
  },

  // Update category
  update: async (req: any, res: any | any) => {
    try {
      const { name, description, image, icon, sortOrder, isActive, isFeatured} = req.body;

      // Build update object
      const updateData: any = {};

      if (name) {
        const isStringName = typeof name === 'string';
        updateData.name = {
          en: isStringName ? name : (name.en || ''),
          ar: isStringName ? name : (name.ar || name.en || ''),
          de: isStringName ? name : (name.de || name.en || '')
        };
      }

      if (description !== undefined) {
        updateData.description = {
          en: description?.en || description || '',
          ar: description?.ar || description || '',
          de: description?.de || description || ''
        };
      }

      if (image !== undefined) updateData.image = image;
      if (icon !== undefined) updateData.icon = icon;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('restaurantId', 'name').lean();

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({
        message: 'Category updated successfully',
        category
      });
    } catch (err: any) {
      console.error('Category update error:', err);
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

  // Delete category
  remove: async (req: any, res: any | any) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check if category has products
      const productCount = await Product.countDocuments({ categoryId: req.params.id });
      if (productCount > 0) {
        return res.status(400).json({
          error: 'Cannot delete category with products',
          details: `Category has ${productCount} products. Please move or delete them first.`
        });
      }

      await Category.findByIdAndDelete(req.params.id);

      res.json({ message: 'Category deleted successfully' });
    } catch (err: any) {
      console.error('Category remove error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Reorder categories
  reorder: async (req: any, res: any | any) => {
    try {
      const { categoryIds } = req.body;

      if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        return res.status(400).json({
          error: 'Invalid category IDs',
          details: 'categoryIds must be a non-empty array'
        });
      }

      // Update sort order for each category
      const updatePromises = categoryIds.map((categoryId: string, index: number) => {
        return Category.findByIdAndUpdate(categoryId, { sortOrder: index + 1 });
      });

      await Promise.all(updatePromises);

      res.json({ message: 'Categories reordered successfully' });
    } catch (err: any) {
      console.error('Category reorder error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get categories with product count
  getWithProductCount: async (req: any, res: any) => {
    try {
      const { restaurantId } = req.query;

      const filter: any = { isActive: true };
      if (restaurantId) filter.restaurantId = restaurantId;

      const categories = await Category.find(filter)
        .populate('restaurantId', 'name')
        .sort({ sortOrder: 1, 'name.en': 1 })
        .lean();

      // Get product count for each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          try {
            const productCount = await Product.countDocuments({
              categoryId: category._id,
              'availability.isAvailable': true
            });

            return {
              ...category,
              activeProductCount: productCount
            };
          } catch (error) {
            console.error('Error getting product count for category:', error);
            return {
              ...category,
              activeProductCount: 0
            };
          }
        })
      );

      res.json(categoriesWithCount);
    } catch (err: any) {
      console.error('Category getWithProductCount error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get featured categories
  getFeatured: async (req: any, res: any) => {
    try {
      const { restaurantId, limit = 10 } = req.query;

      const filter: any = { isFeatured: true, isActive: true };
      if (restaurantId) filter.restaurantId = restaurantId;

      const categories = await Category.find(filter)
        .populate('restaurantId', 'name')
        .sort({ sortOrder: 1, 'name.en': 1 })
        .limit(Number(limit))
        .lean();

      res.json(categories);
    } catch (err: any) {
      console.error('Category getFeatured error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get category statistics
  getStats: async (req: any, res: any) => {
    try {
      const { restaurantId } = req.query;

      const filter: any = {};
      if (restaurantId) filter.restaurantId = restaurantId;

      const stats = await Category.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalCategories: { $sum: 1 },
            activeCategories: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            featuredCategories: {
              $sum: { $cond: ['$isFeatured', 1, 0] }
            },
            totalProducts: { $sum: '$productCount' }
          }
        }
      ]);

      res.json(stats[0] || {
        totalCategories: 0,
        activeCategories: 0,
        featuredCategories: 0,
        totalProducts: 0
      });
    } catch (err: any) {
      console.error('Category getStats error:', err);
      res.status(500).json({ error: err.message });
    }
  }
}; 