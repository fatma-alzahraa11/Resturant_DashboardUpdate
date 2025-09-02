import { Router } from 'express';
import StoreController from '../../controllers/StoreController';
import auth from '../../middleware/auth';

const router = Router();

router.post('/', auth, StoreController.create);
router.get('/', auth, StoreController.list);
router.get('/:id', auth, StoreController.get);
router.put('/:id', auth, StoreController.update);
router.delete('/:id', auth, StoreController.remove);
router.get('/:id/analytics', auth, StoreController.analytics);
router.post('/:id/qr-codes', auth, StoreController.createQRCode);

export default router; 