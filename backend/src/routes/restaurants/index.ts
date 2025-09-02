import { Router } from 'express';
import RestaurantController from '../../controllers/RestaurantController';
import auth from '../../middleware/auth';
import roleCheck from '../../middleware/roleCheck';
import permissionCheck from '../../middleware/permissionCheck';

const router = Router();

// Only super_admin and restaurant_owner with restaurant:write permission can create restaurants
router.post('/', auth, roleCheck(['super_admin', 'restaurant_owner']), permissionCheck(['restaurant:write']), RestaurantController.create);
router.get('/', auth, RestaurantController.list);
router.get('/:id', auth, RestaurantController.get);
router.get('/code/:code', RestaurantController.getByCode); // Public endpoint for staff access
router.get('/validate/:code', RestaurantController.validateCode); // Public endpoint to validate restaurant code
router.get('/:id/code', auth, RestaurantController.getRestaurantCode); // Get restaurant code for owner
router.put('/:id', auth, RestaurantController.update);
router.delete('/:id', auth, RestaurantController.remove);
router.get('/:id/analytics', auth, RestaurantController.analytics);
router.put('/:id/settings', auth, RestaurantController.updateSettings);

export default router; 