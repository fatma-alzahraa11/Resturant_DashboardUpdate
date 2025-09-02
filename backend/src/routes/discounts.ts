import express from 'express';
import DiscountController from '../controllers/DiscountController';

const router = express.Router();

// Create a new discount
router.post('/', DiscountController.create);

// List discounts with filtering and pagination
router.get('/', DiscountController.list);

// Get discount statistics
router.get('/stats', DiscountController.getStats);

// Get active discounts for restaurant
router.get('/active', DiscountController.getActive);

// Validate discount code
router.post('/validate', DiscountController.validateCode);

// Apply discount to order
router.post('/apply', DiscountController.applyToOrder);

// Get discount by ID
router.get('/:id', DiscountController.get);

// Update discount
router.put('/:id', DiscountController.update);

// Delete discount
router.delete('/:id', DiscountController.remove);

export default router;
