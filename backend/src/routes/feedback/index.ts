import { Router } from 'express';
import FeedbackController from '../../controllers/FeedbackController';
import auth from '../../middleware/auth';

const router = Router();

router.post('/', auth, FeedbackController.create);
router.get('/', auth, FeedbackController.list);

// Export endpoint (must come before /:id routes)
router.post('/export', auth, FeedbackController.export);

// Feedback CRUD operations with ID
router.get('/:id', auth, FeedbackController.get);
router.put('/:id', auth, FeedbackController.update);
router.delete('/:id', auth, FeedbackController.remove);
router.post('/:id/response', auth, FeedbackController.respond);

export default router; 