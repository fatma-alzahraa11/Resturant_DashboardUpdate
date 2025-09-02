import { validationResult, body, param, query } from 'express-validator';

const validate = (req: any, res: any, next: any): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Validation rules for user registration
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('role')
    .optional()
    .isIn(['super_admin', 'restaurant_owner', 'store_admin', 'staff'])
    .withMessage('Invalid role'),
  validate
];

// Validation rules for staff registration by restaurant code
export const staffByCodeValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('restaurantCode')
    .trim()
    .isLength({ min: 6, max: 10 })
    .withMessage('Restaurant code must be between 6 and 10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Restaurant code can only contain uppercase letters and numbers'),
  body('kitchenRole')
    .optional()
    .isIn(['cook', 'prep', 'expeditor', 'manager'])
    .withMessage('Invalid kitchen role'),
  validate
];

// Validation rules for restaurant owner registration
export const restaurantOwnerValidation = [
  // User fields validation
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  
  // Restaurant fields validation
  body('restaurantName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Restaurant name must be between 2 and 100 characters'),
  body('restaurantDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Restaurant description cannot exceed 500 characters'),
  body('cuisine')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cuisine type cannot exceed 100 characters'),
  
  // Address validation
  body('address.street')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  body('address.city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('address.state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('address.country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),
  body('address.zipCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('ZIP code cannot exceed 20 characters'),
  body('address.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 numbers'),
  body('address.coordinates.*')
    .optional()
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
  
  // Contact validation
  body('contact.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('contact.website')
    .optional()
    .isURL()
    .withMessage('Please enter a valid website URL'),
  
  // Optional fields
  body('logo')
    .optional()
    .isURL()
    .withMessage('Logo must be a valid URL'),
  body('banner')
    .optional()
    .isURL()
    .withMessage('Banner must be a valid URL'),
  
  validate
];

// Validation rules for super admin restaurant creation
export const adminRestaurantValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Restaurant name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Restaurant description cannot exceed 500 characters'),
  body('cuisine')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cuisine type cannot exceed 100 characters'),
  body('ownerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid owner ID'),
  
  // Address validation
  body('address.street')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  body('address.city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('address.state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('address.country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),
  body('address.zipCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('ZIP code cannot exceed 20 characters'),
  body('address.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 numbers'),
  body('address.coordinates.*')
    .optional()
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
  
  // Contact validation
  body('contact.phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('contact.website')
    .optional()
    .isURL()
    .withMessage('Please enter a valid website URL'),
  
  // Optional fields
  body('logo')
    .optional()
    .isURL()
    .withMessage('Logo must be a valid URL'),
  body('banner')
    .optional()
    .isURL()
    .withMessage('Banner must be a valid URL'),
  
  validate
];

// Validation rules for product creation/update
export const productValidation = [
  body('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('categoryId')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('name')
    .notEmpty()
    .withMessage('Product name is required'),
  body('name.en')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('English name must be between 1 and 100 characters'),
  body('name.ar')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Arabic name must be between 1 and 100 characters'),
  body('name.de')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('German name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('comparePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),
  body('nutritionalInfo.calories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Calories must be a positive integer'),
  body('nutritionalInfo.protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number'),
  body('nutritionalInfo.carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbs must be a positive number'),
  body('nutritionalInfo.fat')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fat must be a positive number'),
  body('preparationTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a positive integer'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a positive integer'),
  validate
];

// Validation rules for category creation/update
export const categoryValidation = [
  body('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('name')
    .notEmpty()
    .withMessage('Category name is required'),
  body('name.en')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('English name must be between 1 and 50 characters'),
  body('name.ar')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Arabic name must be between 1 and 50 characters'),
  body('name.de')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('German name must be between 1 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Icon cannot exceed 50 characters'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a positive integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  validate
];

// Validation rules for discount creation/update
export const discountValidation = [
  body('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('name')
    .notEmpty()
    .withMessage('Discount name is required'),
  body('name.en')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('English name must be between 1 and 100 characters'),
  body('name.ar')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Arabic name must be between 1 and 100 characters'),
  body('name.de')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('German name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('code')
    .optional()
    .matches(/^[A-Z0-9]{3,20}$/)
    .withMessage('Code must be 3-20 characters, letters and numbers only'),
  body('rule.type')
    .isIn(['percentage', 'fixed', 'buy_x_get_y', 'free_shipping'])
    .withMessage('Invalid rule type'),
  body('rule.value')
    .isFloat({ min: 0 })
    .withMessage('Rule value must be a positive number'),
  body('rule.minimumOrder')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order must be a positive number'),
  body('rule.maximumDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount must be a positive number'),
  body('target.type')
    .isIn(['all_products', 'specific_products', 'specific_categories', 'specific_customers'])
    .withMessage('Invalid target type'),
  body('target.productIds')
    .optional()
    .isArray()
    .withMessage('Product IDs must be an array'),
  body('target.categoryIds')
    .optional()
    .isArray()
    .withMessage('Category IDs must be an array'),
  body('target.customerIds')
    .optional()
    .isArray()
    .withMessage('Customer IDs must be an array'),
  body('target.customerGroups')
    .optional()
    .isArray()
    .withMessage('Customer groups must be an array'),
  body('schedule.startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('schedule.endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('customerUsageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer usage limit must be a positive integer'),
  body('priority')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Priority must be a non-negative integer'),
  validate
];

// Validation rules for loyalty program creation/update
export const loyaltyValidation = [
  body('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('name')
    .notEmpty()
    .withMessage('Program name is required'),
  body('name.en')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('English name must be between 1 and 100 characters'),
  body('name.ar')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Arabic name must be between 1 and 100 characters'),
  body('name.de')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('German name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('pointsPerCurrency')
    .isFloat({ min: 0.01 })
    .withMessage('Points per currency must be at least 0.01'),
  body('minimumPointsToRedeem')
    .isInt({ min: 1 })
    .withMessage('Minimum points to redeem must be at least 1'),
  body('pointsExpiryMonths')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points expiry months must be at least 1'),
  body('tiers')
    .optional()
    .isArray()
    .withMessage('Tiers must be an array'),
  body('tiers.*.name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tier name must be between 1 and 50 characters'),
  body('tiers.*.level')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Tier level must be between 1 and 10'),
  body('tiers.*.pointsRequired')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points required must be a non-negative integer'),
  body('settings.allowNegativePoints')
    .optional()
    .isBoolean()
    .withMessage('allowNegativePoints must be a boolean'),
  body('settings.autoEnrollCustomers')
    .optional()
    .isBoolean()
    .withMessage('autoEnrollCustomers must be a boolean'),
  body('settings.welcomePoints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Welcome points must be a non-negative integer'),
  validate
];

// Validation rules for order creation/update
export const orderValidation = [
  body('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('storeId')
    .isMongoId()
    .withMessage('Invalid store ID'),
  body('customerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),
  body('orderNumber')
    .notEmpty()
    .withMessage('Order number is required'),
  body('customerInfo.name')
    .notEmpty()
    .withMessage('Customer name is required'),
  body('customerInfo.phone')
    .notEmpty()
    .withMessage('Customer phone is required'),
  body('customerInfo.email')
    .optional()
    .isEmail()
    .withMessage('Customer email must be valid'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.name')
    .notEmpty()
    .withMessage('Item name is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Item price must be positive'),
  body('items.*.totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Item total price must be positive'),
  body('orderType')
    .isIn(['dine_in', 'takeaway', 'delivery'])
    .withMessage('Invalid order type'),
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'])
    .withMessage('Invalid order status'),
  body('payment.method')
    .isIn(['cash', 'card', 'online'])
    .withMessage('Invalid payment method'),
  body('payment.status')
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  body('payment.amount')
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be positive'),
  body('totals.subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be positive'),
  body('totals.tax')
    .isFloat({ min: 0 })
    .withMessage('Tax must be positive'),
  body('totals.deliveryFee')
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be positive'),
  body('totals.discount')
    .isFloat({ min: 0 })
    .withMessage('Discount must be positive'),
  body('totals.total')
    .isFloat({ min: 0 })
    .withMessage('Total must be positive'),
  validate
];

// Validation rules for customer creation/update
export const customerValidation = [
  body('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('name')
    .notEmpty()
    .withMessage('Customer name is required'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('address.street')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  body('address.city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('address.zipCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Zip code cannot exceed 20 characters'),
  body('preferences.dietaryRestrictions')
    .optional()
    .isArray()
    .withMessage('Dietary restrictions must be an array'),
  body('preferences.favoriteItems')
    .optional()
    .isArray()
    .withMessage('Favorite items must be an array'),
  body('preferences.language')
    .optional()
    .isIn(['en', 'ar', 'de'])
    .withMessage('Language must be en, ar, or de'),
  validate
];

// Validation rules for feedback creation/update
export const feedbackValidation = [
  body('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('customerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),
  body('customerName')
    .notEmpty()
    .withMessage('Customer name is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),
  body('categories.food')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Food rating must be between 1 and 5'),
  body('categories.service')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service rating must be between 1 and 5'),
  body('categories.ambiance')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Ambiance rating must be between 1 and 5'),
  body('categories.value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value rating must be between 1 and 5'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  validate
];

// Validation rules for payment creation
export const paymentValidation = [
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('customerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be positive'),
  body('currency')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('method')
    .isIn(['cash', 'card', 'online'])
    .withMessage('Invalid payment method'),
  body('status')
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  body('gateway')
    .optional()
    .isIn(['stripe', 'paypal', 'cash'])
    .withMessage('Invalid payment gateway'),
  validate
];

// Validation rules for query parameters
export const queryValidation = [
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
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('sortBy')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort by field must be between 1 and 50 characters'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  validate
];

// Validation rules for ID parameters
export const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];

export { validate };
