import { Router } from 'express';
import CategoryController from '../../controllers/CategoryController';
import auth from '../../middleware/auth';
import { categoryValidation, queryValidation, idValidation } from '../../middleware/validation';

const router = Router();

// CRUD operations with validation
router.post('/', auth, categoryValidation, CategoryController.create);
router.get('/', auth, queryValidation, CategoryController.list);

// Additional category endpoints (must come before /:id routes)
router.put('/reorder', auth, CategoryController.reorder);
router.get('/with-product-count', auth, CategoryController.getWithProductCount);
router.get('/featured', auth, CategoryController.getFeatured);
router.get('/stats', auth, CategoryController.getStats);

// Category CRUD operations with ID
router.get('/:id', auth, idValidation, CategoryController.get);
router.put('/:id', auth, idValidation, categoryValidation, CategoryController.update);
router.delete('/:id', auth, idValidation, CategoryController.remove);

export default router; 