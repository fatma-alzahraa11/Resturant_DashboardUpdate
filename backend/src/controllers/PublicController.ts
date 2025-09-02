import Restaurant from '../models/Restaurant';
import Store from '../models/Store';
import Product from '../models/Product';
import Category from '../models/Category';
import Order from '../models/Order';
import Table, { ITable, ITableModel } from '../models/Table';
import qrService from '../services/qrService';
import { rateLimit } from 'express-rate-limit';

// Rate limiting for public endpoints
export const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const orderRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 order requests per 5 minutes
  message: 'Too many order requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  // Get restaurant menu by restaurant and store
  getMenu: async (req: any, res: any) => {
    try {
      const { restaurantId, storeId } = req.params;
      const { tableNumber } = req.query;

      // Validate restaurant and store
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant || !restaurant.isActive) {
        return res.status(404).json({ error: 'Restaurant not found or inactive' });
      }

      const store = await Store.findOne({ 
        _id: storeId, 
        restaurantId, 
        isActive: true 
      });
      if (!store) {
        return res.status(404).json({ error: 'Store not found or inactive' });
      }

      // Get categories with products
      const categories = await Category.find({ 
        restaurantId, 
        isActive: true 
      }).sort({ sortOrder: 1 });

      // Get products for each category
      const menuData = await Promise.all(
        categories.map(async (category) => {
          const products = await Product.find({
            restaurantId,
            categoryId: category._id,
            'availability.isAvailable': true
          }).sort({ sortOrder: 1, name: 1 });

          return {
            category: {
              _id: category._id,
              name: category.name,
              description: category.description,
              image: category.image
            },
            products: products.map(product => ({
              _id: product._id,
              name: product.name,
              description: product.description,
              price: product.price,
              originalPrice: product.originalPrice,
              // images: product.images,
              ingredients: product.ingredients,
              allergens: product.allergens,
              nutritionalInfo: product.nutritionalInfo,
              customization: product.customization,
              preparation: product.preparation,
              ratings: product.ratings,
              tags: product.tags,
              isFeatured: product.isFeatured,
              isPopular: product.isPopular
            }))
          };
        })
      );

      // Filter out empty categories
      const filteredMenu = menuData.filter(category => category.products.length > 0);

      // Get table info if tableNumber is provided
      let tableInfo = null;
      if (tableNumber) {
        const table = await Table.findOne({
          storeId,
          tableNumber,
          isActive: true
        });
        
        if (table) {
          (table as any).incrementQRScan();
          await table.save();
          
          tableInfo = {
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            location: table.location,
            isAvailable: table.status.isAvailable && !table.status.isOccupied
          };
        }
      }

      res.json({
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          description: restaurant.description,
          logo: restaurant.logo,
          banner: restaurant.banner,
          cuisine: restaurant.cuisine,
          settings: restaurant.settings
        },
        store: {
          _id: store._id,
          name: store.name,
          address: store.address,
          contact: store.contact,
          settings: store.settings
        },
        table: tableInfo,
        menu: filteredMenu,
        timestamp: new Date()
      });
    } catch (err: any) {
      console.error('Error fetching menu:', err);
      res.status(500).json({ error: 'Failed to fetch menu' });
    }
  },

  // Validate QR code and return restaurant/store info
  validateQR: async (req: any, res: any) => {
    try {
      const { qrCode } = req.params;

      if (!qrCode) {
        return res.status(400).json({ error: 'QR code is required' });
      }

      // Parse QR code data
      let qrData;
      try {
        qrData = qrService.parseQRCode(qrCode);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid QR code format' });
      }

      // Validate QR code
      if (!qrService.validateQRCode(qrCode)) {
        return res.status(400).json({ error: 'Invalid QR code' });
      }

      // Find table by QR code
      const table = await (Table as any).findByQRCode(qrCode);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      // Check if QR code is expired
      if ((table as any).qrExpired) {
        return res.status(400).json({ error: 'QR code has expired' });
      }

      // Get restaurant and store info
      const restaurant = await Restaurant.findById(table.restaurantId);
      const store = await Store.findById(table.storeId);

      if (!restaurant || !restaurant.isActive || !store || !store.isActive) {
        return res.status(404).json({ error: 'Restaurant or store not found' });
      }

      // Increment scan count
      (table as any).incrementQRScan();
      await table.save();

      res.json({
        valid: true,
        table: {
          _id: table._id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          location: table.location,
          isAvailable: table.status.isAvailable && !table.status.isOccupied
        },
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          description: restaurant.description,
          logo: restaurant.logo,
          cuisine: restaurant.cuisine
        },
        store: {
          _id: store._id,
          name: store.name,
          address: store.address
        },
        menuUrl: `/api/public/menu/${restaurant._id}/${store._id}?tableNumber=${table.tableNumber}`
      });
    } catch (err: any) {
      console.error('Error validating QR code:', err);
      res.status(500).json({ error: 'Failed to validate QR code' });
    }
  },

  // Create guest order
  createGuestOrder: async (req: any, res: any) => {
    try {
      const {
        restaurantId,
        storeId,
        tableNumber,
        customerInfo,
        items,
        orderType = 'dine_in',
        customerNotes
      } = req.body;

      // Validate required fields
      if (!restaurantId || !storeId || !customerInfo || !items || items.length === 0) {
        return res.status(400).json({ 
          error: 'Missing required fields: restaurantId, storeId, customerInfo, items' 
        });
      }

      // Validate restaurant and store
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant || !restaurant.isActive) {
        return res.status(404).json({ error: 'Restaurant not found or inactive' });
      }

      const store = await Store.findById(storeId);
      if (!store || !store.isActive || store.restaurantId.toString() !== restaurantId) {
        return res.status(404).json({ error: 'Store not found or inactive' });
      }

      // Validate table if dine-in order
      if (orderType === 'dine_in') {
        if (!tableNumber) {
          return res.status(400).json({ error: 'Table number is required for dine-in orders' });
        }

        const table = await Table.findOne({
          storeId,
          tableNumber,
          isActive: true
        });

        if (!table) {
          return res.status(404).json({ error: 'Table not found' });
        }

        if (!table.status.isAvailable || table.status.isOccupied) {
          return res.status(400).json({ error: 'Table is not available' });
        }
      }

      // Validate customer info
      if (!customerInfo.name || !customerInfo.phone) {
        return res.status(400).json({ 
          error: 'Customer name and phone are required' 
        });
      }

      // Validate items
      const validatedItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          restaurantId,
          'availability.isAvailable': true
        });

        if (!product) {
          return res.status(400).json({ 
            error: `Product ${item.productId} not found or unavailable` 
          });
        }

        // Validate quantity
        if (!item.quantity || item.quantity < 1) {
          return res.status(400).json({ 
            error: `Invalid quantity for product ${product.name.en}` 
          });
        }

        // Calculate item total
        let itemTotal = product.price * item.quantity;
        let addOnsTotal = 0;

        // Validate add-ons if provided
        if (item.addOns && item.addOns.length > 0) {
          for (const addOn of item.addOns) {
            if (!addOn.name || !addOn.price || addOn.quantity < 1) {
              return res.status(400).json({ 
                error: 'Invalid add-on data' 
              });
            }
            addOnsTotal += addOn.price * addOn.quantity;
          }
        }

        itemTotal += addOnsTotal;
        subtotal += itemTotal;

        validatedItems.push({
          productId: product._id,
          name: product.name.en,
          nameAr: product.name.ar,
          nameDe: product.name.de,
          price: product.price,
          quantity: item.quantity,
          addOns: item.addOns || [],
          notes: item.notes || '',
          totalPrice: itemTotal,
          preparationTime: product.preparation.time
        });
      }

      // Calculate totals
      const tax = (subtotal * (restaurant.settings.taxRate || 0)) / 100;
      const serviceCharge = (subtotal * (restaurant.settings.serviceCharge || 0)) / 100;
      const total = subtotal + tax + serviceCharge;

      // Create order
      const order = new Order({
        restaurantId,
        storeId,
        customerInfo,
        items: validatedItems,
        orderType,
        tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
        status: 'pending',
        payment: {
          method: 'cash', // Default for guest orders
          status: 'pending',
          amount: total
        },
        totals: {
          subtotal,
          tax,
          deliveryFee: 0,
          discount: 0,
          tip: 0,
          total
        },
        customerNotes,
        estimatedTime: new Date(Date.now() + (restaurant.settings.orderPreparationTime || 20) * 60 * 1000)
      });

      await order.save();

      // Occupy table if dine-in order
      if (orderType === 'dine_in' && tableNumber) {
        const table = await Table.findOne({ storeId, tableNumber });
        if (table) {
          (table as any).occupy((order as any)._id.toString());
          await table.save();
        }
      }

      // Send notification to kitchen
      const notificationService = require('../services/notificationService').default;
      notificationService.notifyNewOrder(order);

      res.status(201).json({
        success: true,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          estimatedTime: order.estimatedTime,
          total: order.totals.total
        },
        message: 'Order created successfully'
      });
    } catch (err: any) {
      console.error('Error creating guest order:', err);
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  // Get order status (public endpoint)
  getOrderStatus: async (req: any, res: any) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findById(orderId)
        .populate('restaurantId', 'name logo')
        .populate('storeId', 'name');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedTime: order.estimatedTime,
        actualTime: order.actualTime,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        restaurant: order.restaurantId,
        store: order.storeId,
        total: order.totals.total,
        items: order.items.length,
        customerInfo: {
          name: order.customerInfo.name,
          phone: order.customerInfo.phone
        }
      });
    } catch (err: any) {
      console.error('Error fetching order status:', err);
      res.status(500).json({ error: 'Failed to fetch order status' });
    }
  },

  // Get restaurant info by code
  getRestaurantByCode: async (req: any, res: any) => {
    try {
      const { code } = req.params;

      const restaurant = await Restaurant.findOne({ 
        restaurantCode: code.toUpperCase(),
        isActive: true 
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const stores = await Store.find({ 
        restaurantId: restaurant._id,
        isActive: true 
      }).select('name address');

      res.json({
        restaurant: {
          _id: restaurant._id,
          name: restaurant.name,
          description: restaurant.description,
          logo: restaurant.logo,
          banner: restaurant.banner,
          cuisine: restaurant.cuisine,
          address: restaurant.address,
          contact: restaurant.contact
        },
        stores: stores.map(store => ({
          _id: store._id,
          name: store.name,
          address: store.address
        }))
      });
    } catch (err: any) {
      console.error('Error fetching restaurant by code:', err);
      res.status(500).json({ error: 'Failed to fetch restaurant' });
    }
  }
}; 