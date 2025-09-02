import { Router } from 'express';
import DiscountController from '../../controllers/DiscountController';
import auth from '../../middleware/auth';

const router = Router();

// CRUD operations
router.post('/', auth, DiscountController.create);
router.get('/', auth, DiscountController.list);

// Discount validation and application (must come before /:id routes)
router.post('/validate-code', auth, DiscountController.validateCode);
router.post('/apply', auth, DiscountController.applyToOrder);

// Public endpoints (no auth required for customers)
router.get('/active', DiscountController.getActive);

// Statistics
router.get('/stats', auth, DiscountController.getStats);

// Discount CRUD operations with ID
router.get('/:id', auth, DiscountController.get);
router.put('/:id', auth, DiscountController.update);
router.delete('/:id', auth, DiscountController.remove);

export default router; 