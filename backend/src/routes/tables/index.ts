import { Router } from 'express';
import TableController from '../../controllers/TableController';
import auth from '../../middleware/auth';

const router = Router();

// Table management routes (authenticated)
router.post('/', auth, TableController.create);
router.get('/store/:storeId', auth, TableController.list);
router.get('/:id', auth, TableController.get);
router.put('/:id', auth, TableController.update);
router.delete('/:id', auth, TableController.remove);

// Table operations
router.put('/:id/free', auth, TableController.freeTable);
router.put('/:id/occupy', auth, TableController.occupyTable);
router.put('/:id/qr/regenerate', auth, TableController.regenerateQR);

// Table statistics
router.get('/store/:storeId/statistics', auth, TableController.getStatistics);

// Bulk operations
router.post('/bulk', auth, TableController.bulkCreate);

export default router; 