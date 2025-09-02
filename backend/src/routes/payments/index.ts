import { Router } from 'express';
import PaymentController from '../../controllers/PaymentController';
import auth from '../../middleware/auth';

const router = Router();

router.post('/create-intent', auth, PaymentController.createIntent);
router.post('/confirm', auth, PaymentController.confirm);
router.post('/refund', auth, PaymentController.refund);
router.get('/', auth, PaymentController.listByRestaurant);
router.get('/:id', auth, PaymentController.get);

export default router; 