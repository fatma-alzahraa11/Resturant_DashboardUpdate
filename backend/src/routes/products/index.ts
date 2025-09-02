import { Router } from 'express';
import ProductController from '../../controllers/ProductController';
import auth from '../../middleware/auth';
import { productValidation, queryValidation, idValidation } from '../../middleware/validation';

const router = Router();

// CRUD operations with validation
router.post('/', auth, productValidation, ProductController.create);
router.get('/', auth, queryValidation, ProductController.list);

// Additional product endpoints (must come before /:id routes)
router.get('/popular', auth, ProductController.getPopular);
router.get('/new', auth, ProductController.getNew);
router.get('/category/:categoryId', auth, ProductController.getByCategory);

// Product CRUD operations with ID
router.get('/:id', auth, idValidation, ProductController.get);
router.put('/:id', auth, idValidation, productValidation, ProductController.update);
router.delete('/:id', auth, idValidation, ProductController.remove);

// Product availability
router.put('/:id/availability', auth, idValidation, ProductController.updateAvailability);

// Product images
router.post('/:id/images', auth, idValidation, ProductController.addImage);
router.delete('/:id/images/:imageId', auth, idValidation, ProductController.removeImage);

export default router; 