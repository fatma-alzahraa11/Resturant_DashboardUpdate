import { Router } from 'express';
import CustomerController from '../../controllers/CustomerController';
import auth from '../../middleware/auth';

const router = Router();

router.post('/', auth, CustomerController.create);
router.get('/', auth, CustomerController.list);

// Export endpoint (must come before /:id routes)
router.post('/export', auth, CustomerController.export);

// Customer CRUD operations with ID
router.get('/:id', auth, CustomerController.get);
router.put('/:id', auth, CustomerController.update);
router.delete('/:id', auth, CustomerController.remove);
router.get('/:id/orders', auth, CustomerController.getOrders);
router.get('/:id/feedback', auth, CustomerController.getFeedback);

export default router; 