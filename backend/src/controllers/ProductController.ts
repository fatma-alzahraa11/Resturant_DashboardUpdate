import Product from '../models/Product';
import Category from '../models/Category';
import { Request, Response } from 'express';

export default {
  // Create a new product
  create: async (req: any, res: any) => {
    try {
      const authRestaurantId = req.user?.restaurantId;
      const { restaurantId: bodyRestaurantId, categoryId, name, description, price, ingredients, images, allergens, nutritionalInfo, availability, isNewItem, isPopular, isVegetarian, isVegan, isGlutenFree, isSpicy, preparationTime, sortOrder } = req.body;
      const restaurantId = authRestaurantId || bodyRestaurantId;
      const topLevelIsAvailable = typeof req.body.isAvailable === 'boolean' ? req.body.isAvailable : undefined;

      // Validate required fields
      if (!restaurantId || !categoryId || !name || !description || price === undefined) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'restaurantId, categoryId, name, description, and price are required'
        });
      }

      // Validate category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Validate price
      if (price < 0) {
        return res.status(400).json({ error: 'Price cannot be negative' });
      }

      // Helper function to normalize ingredients
      const normalizeIngredients = (ingredients: any): string[] => {
        if (Array.isArray(ingredients)) {
          return ingredients;
        }
        if (ingredients && typeof ingredients === 'object') {
          // If it's an object with language keys, use the first available array
          if (ingredients.en && Array.isArray(ingredients.en)) return ingredients.en;
          if (ingredients.ar && Array.isArray(ingredients.ar)) return ingredients.ar;
          if (ingredients.de && Array.isArray(ingredients.de)) return ingredients.de;
        }
        return [];
      };

      // Normalize allergens
      const normalizeAllergens = (input: any): string[] => {
        if (Array.isArray(input)) return input;
        if (typeof input === 'string') {
          return input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return [];
      };

      // Create product with proper structure
      const normalizedAllergens = normalizeAllergens(allergens);

      // Require allergens on create
      if (!normalizedAllergens || normalizedAllergens.length === 0) {
        return res.status(400).json({
          error: 'Allergens are required',
          details: ['Please provide at least one allergen']
        });
      }

      const productData: any = {
        restaurantId,
        categoryId,
        name: {
          en: name.en || name,

        },
        description: {
          en: description.en || description,

        },
        price,
        availability: availability || {
          isAvailable: topLevelIsAvailable !== undefined ? topLevelIsAvailable : true,
          stockQuantity: null,
          lowStockThreshold: null
        },
        ingredients: normalizeIngredients(ingredients),
        allergens: normalizedAllergens,
        isNewItem: typeof isNewItem === 'boolean' ? isNewItem : false,
        images: Array.isArray(images) ? images : [],
        //   isPopular: isPopular || false,

      };
      // const productData = {
      //   restaurantId,
      //   categoryId,
      //   name: {
      //     en: name.en || name,

      //   },
      //   description: {
      //     en: description.en || description,

      //   },
      //   price,
      //   ingredients: normalizeIngredients(ingredients),
      //   allergens: allergens || [],
      //   nutritionalInfo: nutritionalInfo || {
      //     calories: 0,
      //     protein: 0,
      //     carbs: 0,
      //     fat: 0
      //   },
      //   availability: availability || {
      //     isAvailable: true,
      //     stockQuantity: null,
      //     lowStockThreshold: null
      //   },
      //   isNewItem: isNewItem || false,
      //   isPopular: isPopular || false,
      //   isVegetarian: isVegetarian || false,
      //   isVegan: isVegan || false,
      //   isGlutenFree: isGlutenFree || false,
      //   isSpicy: isSpicy || false,
      //   preparationTime: preparationTime || 0,
      //   sortOrder: sortOrder || 0,
      //   viewCount: 0,
      //   orderCount: 0,
      //   rating: 0,
      //   totalReviews: 0
      // };

      const product = new Product(productData);
      await product.save();

      // Update category product count
      await Category.findByIdAndUpdate(categoryId, {
        $inc: { productCount: 1 }
      });

      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (err: any) {
      console.error('Product creation error:', err);

      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map((error: any) => error.message);
        return res.status(400).json({
          error: 'Validation failed',
          details: validationErrors
        });
      }

      if (err.name === 'CastError') {
        return res.status(400).json({
          error: 'Invalid data format',
          details: [`Invalid format for field: ${err.path}`]
        });
      }

      res.status(500).json({ error: err.message });
    }
  },

  // List products with filtering and pagination
  list: async (req: any, res: any) => {
    try {
      const {
        restaurantId,
        categoryId,
        search,
        isAvailable,
        isNewItem,
        isPopular,
        isVegetarian,
        isVegan,
        page = 1,
        limit = 20,
        sortBy = 'sortOrder',
        sortOrder = 'asc'
      } = req.query;

      // Build filter object
      const filter: any = {};

      const effectiveRestaurantId = req.user?.restaurantId || restaurantId;
      if (effectiveRestaurantId) filter.restaurantId = effectiveRestaurantId;
      if (categoryId) filter.categoryId = categoryId;
      if (isAvailable !== undefined) filter['availability.isAvailable'] = isAvailable === 'true';
      if (isNewItem !== undefined) filter.isNewItem = isNewItem === 'true';
      if (isPopular !== undefined) filter.isPopular = isPopular === 'true';
      if (isVegetarian !== undefined) filter.isVegetarian = isVegetarian === 'true';
      if (isVegan !== undefined) filter.isVegan = isVegan === 'true';

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

      const products = await Product.find(filter)
        .populate('categoryId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

      const total = await Product.countDocuments(filter);

      res.json({
        products,
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

  // Get product by ID
  get: async (req: any, res: any) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate('categoryId', 'name')
        .populate('restaurantId', 'name');

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Increment view count
      await Product.findByIdAndUpdate(req.params.id, {
        $inc: { viewCount: 1 }
      });

      res.json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Update product
  update: async (req: any, res: any) => {
    try {
      const {
        name,
        description,
        price,
        ingredients,
        images,
        allergens,
        //nutritionalInfo,
        availability,
        isAvailable,
        isNewItem,
       // isPopular,
       // isVegetarian,
        // isVegan,
        // isGlutenFree,
        // isSpicy,
        // preparationTime,
        // sortOrder
      } = req.body;
      const { categoryId } = req.body;

      // Validate price if provided
      if (price !== undefined && price < 0) {
        return res.status(400).json({ error: 'Price cannot be negative' });
      }

      // Load existing product to compare category
      const existingProduct = await Product.findById(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
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

      if (description) {
        updateData.description = {
          en: description.en || description,
          ar: description.ar || description,
          de: description.de || description
        };
      }

      if (price !== undefined) updateData.price = price;
      if (ingredients !== undefined) {
        if (Array.isArray(ingredients)) {
          updateData.ingredients = ingredients;
        } else if (typeof ingredients === 'string') {
          updateData.ingredients = ingredients
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        } else if (ingredients && typeof ingredients === 'object') {
          if (Array.isArray((ingredients as any).en)) updateData.ingredients = (ingredients as any).en;
          else if (Array.isArray((ingredients as any).ar)) updateData.ingredients = (ingredients as any).ar;
          else if (Array.isArray((ingredients as any).de)) updateData.ingredients = (ingredients as any).de;
        }
      }
      if (images !== undefined) updateData.images = images;
      if (allergens !== undefined) {
        if (Array.isArray(allergens)) {
          updateData.allergens = allergens;
        } else if (typeof allergens === 'string') {
          updateData.allergens = allergens
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
      }
      //if (nutritionalInfo !== undefined) updateData.nutritionalInfo = nutritionalInfo;
      if (availability !== undefined) updateData.availability = availability;
      if (typeof isAvailable === 'boolean') updateData['availability.isAvailable'] = isAvailable;
      if (typeof isNewItem === 'boolean') updateData.isNewItem = isNewItem;
     // if (isPopular !== undefined) updateData.isPopular = isPopular;
     // if (isVegetarian !== undefined) updateData.isVegetarian = isVegetarian;
      //if (isVegan !== undefined) updateData.isVegan = isVegan;
      //if (isGlutenFree !== undefined) updateData.isGlutenFree = isGlutenFree;
     // if (isSpicy !== undefined) updateData.isSpicy = isSpicy;
      //if (preparationTime !== undefined) updateData.preparationTime = preparationTime;
    // if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

      // Handle category change if provided
      let updateCategoryCount = false;
      let previousCategoryId: any = null;
      if (categoryId) {
        // Validate new category exists
        const targetCategory = await Category.findById(categoryId);
        if (!targetCategory) {
          return res.status(404).json({ error: 'Category not found' });
        }
        const isDifferent = String(existingProduct.categoryId) !== String(categoryId);
        if (isDifferent) {
          updateData.categoryId = categoryId;
          updateCategoryCount = true;
          previousCategoryId = existingProduct.categoryId;
        }
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('categoryId', 'name');

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Update category counts if category was changed
      if (updateCategoryCount && previousCategoryId) {
        await Category.findByIdAndUpdate(previousCategoryId, { $inc: { productCount: -1 } });
        await Category.findByIdAndUpdate(product.categoryId, { $inc: { productCount: 1 } });
      }

      res.json({
        message: 'Product updated successfully',
        product
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

  // Delete product
  remove: async (req: any, res: any) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Update category product count
      await Category.findByIdAndUpdate(product.categoryId, {
        $inc: { productCount: -1 }
      });

      await Product.findByIdAndDelete(req.params.id);

      res.json({ message: 'Product deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update product availability
  updateAvailability: async (req: any, res: any) => {
    try {
      const { isAvailable, stockQuantity, lowStockThreshold } = req.body;

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          'availability.isAvailable': isAvailable,
          'availability.stockQuantity': stockQuantity,
          'availability.lowStockThreshold': lowStockThreshold
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        message: 'Product availability updated successfully',
        product
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Add image to product
  addImage: async (req: any, res: any) => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $push: { images: imageUrl } },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        message: 'Image added successfully',
        product
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Remove image from product
  removeImage: async (req: any, res: any) => {
    try {
      const { imageId } = req.params;

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $pull: { images: imageId } },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        message: 'Image removed successfully',
        product
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get products by category
  getByCategory: async (req: any, res: any) => {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const products = await Product.find({ categoryId })
        .populate('categoryId', 'name')
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Product.countDocuments({ categoryId });

      res.json({
        products,
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

  // Get popular products
  getPopular: async (req: any, res: any) => {
    try {
      const { restaurantId, limit = 10 } = req.query;

      const filter: any = { isPopular: true };
      if (restaurantId) filter.restaurantId = restaurantId;

      const products = await Product.find(filter)
        .populate('categoryId', 'name')
        .sort({ orderCount: -1, rating: -1 })
        .limit(Number(limit));

      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get new products
  getNew: async (req: any, res: any) => {
    try {
      const { restaurantId, limit = 10 } = req.query;

      const filter: any = { isNewItem: true };
      if (restaurantId) filter.restaurantId = restaurantId;

      const products = await Product.find(filter)
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}; 