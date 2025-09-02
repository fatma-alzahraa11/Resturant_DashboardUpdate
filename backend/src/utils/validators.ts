import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Order item validation schema
export const orderItemSchema = Joi.object({
  productId: Joi.string().required().messages({
    'string.empty': 'Product ID is required',
    'any.required': 'Product ID is required'
  }),
  quantity: Joi.number().integer().min(1).max(50).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be a whole number',
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 50',
    'any.required': 'Quantity is required'
  }),
  addOns: Joi.array().items(
    Joi.object({
      name: Joi.string().required().max(100),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().integer().min(1).max(10).required()
    })
  ).max(10),
  notes: Joi.string().max(200).allow('', null)
});

// Customer info validation schema
export const customerInfoSchema = Joi.object({
  name: Joi.string().required().min(2).max(100).trim().messages({
    'string.empty': 'Customer name is required',
    'string.min': 'Customer name must be at least 2 characters',
    'string.max': 'Customer name cannot exceed 100 characters',
    'any.required': 'Customer name is required'
  }),
  phone: Joi.string().required().pattern(/^[\+]?[1-9][\d]{0,15}$/).messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please enter a valid phone number',
    'any.required': 'Phone number is required'
  }),
  email: Joi.string().email().allow('', null).messages({
    'string.email': 'Please enter a valid email address'
  })
});

// Order creation validation schema
export const createOrderSchema = Joi.object({
  restaurantId: Joi.string().required().messages({
    'string.empty': 'Restaurant ID is required',
    'any.required': 'Restaurant ID is required'
  }),
  storeId: Joi.string().required().messages({
    'string.empty': 'Store ID is required',
    'any.required': 'Store ID is required'
  }),
  tableNumber: Joi.string().when('orderType', {
    is: 'dine_in',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'any.required': 'Table number is required for dine-in orders'
  }),
  customerInfo: customerInfoSchema.required(),
  items: Joi.array().items(orderItemSchema).min(1).max(50).required().messages({
    'array.min': 'Order must have at least one item',
    'array.max': 'Order cannot have more than 50 items',
    'any.required': 'Order items are required'
  }),
  orderType: Joi.string().valid('dine_in', 'takeaway', 'delivery').required().messages({
    'any.only': 'Order type must be dine_in, takeaway, or delivery',
    'any.required': 'Order type is required'
  }),
  customerNotes: Joi.string().max(300).allow('', null),
  deliveryAddress: Joi.object({
    street: Joi.string().required().max(200),
    city: Joi.string().required().max(100),
    state: Joi.string().required().max(100),
    country: Joi.string().required().max(100),
    zipCode: Joi.string().required().max(20),
    instructions: Joi.string().max(300).allow('', null),
    contactPhone: Joi.string().required(),
    contactName: Joi.string().required().max(100)
  }).when('orderType', {
    is: 'delivery',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  })
});

// Order status update validation schema
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled', 'delivered').required().messages({
    'any.only': 'Invalid order status',
    'any.required': 'Order status is required'
  }),
  assignedTo: Joi.string().optional(),
  estimatedTime: Joi.date().optional(),
  notes: Joi.string().max(500).allow('', null),
  cancellationReason: Joi.string().when('status', {
    is: 'cancelled',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }).max(200)
});

// Bulk order status update schema
export const bulkOrderStatusSchema = Joi.object({
  orderIds: Joi.array().items(Joi.string()).min(1).max(50).required().messages({
    'array.min': 'At least one order ID is required',
    'array.max': 'Cannot update more than 50 orders at once',
    'any.required': 'Order IDs are required'
  }),
  status: Joi.string().valid('confirmed', 'preparing', 'ready', 'cancelled').required().messages({
    'any.only': 'Invalid order status for bulk update',
    'any.required': 'Order status is required'
  }),
  assignedTo: Joi.string().optional(),
  notes: Joi.string().max(500).allow('', null)
});

// Customer authentication schema
export const customerAuthSchema = Joi.object({
  phone: Joi.string().required().pattern(/^[\+]?[1-9][\d]{0,15}$/).messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please enter a valid phone number',
    'any.required': 'Phone number is required'
  }),
  name: Joi.string().required().min(2).max(100).trim().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().allow('', null).messages({
    'string.email': 'Please enter a valid email address'
  })
});

// QR code validation schema
export const qrCodeSchema = Joi.object({
  qrCode: Joi.string().required().messages({
    'string.empty': 'QR code is required',
    'any.required': 'QR code is required'
  })
});

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
      return;
    }

    // Replace request body with validated data
    req.body = value;
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        error: 'Query validation failed',
        details: errorMessages
      });
      return;
    }

    // Replace request query with validated data
    req.query = value;
    next();
  };
};

// Params validation middleware
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        error: 'Parameter validation failed',
        details: errorMessages
      });
      return;
    }

    // Replace request params with validated data
    req.params = value;
    next();
  };
};

// Order status transition validation
export const validateOrderStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  const validTransitions: { [key: string]: string[] } = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['served', 'delivered'],
    'served': [],
    'delivered': [],
    'cancelled': []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Validate order items for availability and pricing
export const validateOrderItems = async (items: any[], restaurantId: string): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  for (const item of items) {
    // Check if product exists and is available
    // This would typically query the database
    if (!item.productId) {
      errors.push('Product ID is required for all items');
    }
    
    if (!item.quantity || item.quantity < 1) {
      errors.push('Quantity must be at least 1 for all items');
    }
    
    if (item.quantity > 50) {
      errors.push('Quantity cannot exceed 50 for any item');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
