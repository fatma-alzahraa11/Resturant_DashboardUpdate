import { Router } from 'express';
import OfferController from '../../controllers/OfferController';
import auth from '../../middleware/auth';
import { validationResult } from 'express-validator';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation middleware
const validate = (req: any, res: any, next: any): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Validation schemas
const createOfferValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  
  body('image')
    .optional()
    .isString()
    .withMessage('Image must be a string')
    .trim(),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['EUR', 'USD', 'GBP', 'SAR', 'AED'])
    .withMessage('Invalid currency'),
  
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product is required'),
  
  body('products.*.productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('products.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('products.*.unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(['Number', 'KG', 'None'])
    .withMessage('Invalid unit'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  body('validFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid validFrom date'),
  
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Invalid validUntil date'),
  
  body('maxRedemptions')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max redemptions must be a positive number'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .isLength({ max: 50 })
    .withMessage('Tag cannot exceed 50 characters')
    .trim(),
  
  body('storeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID')
];

const updateOfferValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid offer ID'),
  
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  
  body('image')
    .optional()
    .isString()
    .withMessage('Image must be a string')
    .trim(),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  
  body('currency')
    .optional()
    .isIn(['EUR', 'USD', 'GBP', 'SAR', 'AED'])
    .withMessage('Invalid currency'),
  
  body('products')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one product is required if products are provided'),
  
  body('products.*.productId')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('products.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('products.*.unit')
    .optional()
    .isIn(['Number', 'KG', 'None'])
    .withMessage('Invalid unit'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  body('validFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid validFrom date'),
  
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Invalid validUntil date'),
  
  body('maxRedemptions')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max redemptions must be a positive number'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .isLength({ max: 50 })
    .withMessage('Tag cannot exceed 50 characters')
    .trim()
];

const listOffersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim(),
  
  query('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  query('sortBy')
    .optional()
    .isIn(['title', 'price', 'createdAt', 'updatedAt', 'currentRedemptions'])
    .withMessage('Invalid sortBy field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),
  
  query('storeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid offer ID')
];

const redeemOfferValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid offer ID'),
  
  body('customerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID')
];

const publicOfferValidation = [
  param('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  
  param('storeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid store ID')
];

// Protected routes (require authentication)
router.post('/', 
  auth, 
  createOfferValidation, 
  validate, 
  OfferController.create
);

router.get('/', 
  auth, 
  listOffersValidation, 
  validate, 
  OfferController.list
);

router.get('/statistics', 
  auth, 
  OfferController.getStatistics
);

router.get('/:id', 
  auth, 
  idValidation, 
  validate, 
  OfferController.get
);

router.put('/:id', 
  auth, 
  updateOfferValidation, 
  validate, 
  OfferController.update
);

router.delete('/:id', 
  auth, 
  idValidation, 
  validate, 
  OfferController.remove
);

router.patch('/:id/toggle-availability', 
  auth, 
  idValidation, 
  validate, 
  OfferController.toggleAvailability
);

// Public routes (no authentication required)
router.get('/public/restaurant/:restaurantId', 
  publicOfferValidation, 
  validate, 
  OfferController.getActiveOffers
);

router.get('/public/restaurant/:restaurantId/store/:storeId', 
  publicOfferValidation, 
  validate, 
  OfferController.getActiveOffers
);

router.post('/public/:id/redeem', 
  redeemOfferValidation, 
  validate, 
  OfferController.redeemOffer
);

export default router;

