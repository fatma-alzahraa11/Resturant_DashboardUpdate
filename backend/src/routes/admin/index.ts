import { Router } from 'express';
import SuperAdminController from '../../controllers/SuperAdminController';
import auth from '../../middleware/auth';
import roleCheck from '../../middleware/roleCheck';
import { idValidation, adminRestaurantValidation } from '../../middleware/validation';

const router = Router();

// All routes require authentication and super admin role
router.use(auth);
router.use(roleCheck(['super_admin']));

// Restaurant management routes
router.get('/restaurants', SuperAdminController.listRestaurants);
router.post('/restaurants', adminRestaurantValidation, SuperAdminController.createRestaurant);
router.put('/restaurants/:restaurantId', idValidation, SuperAdminController.updateRestaurant);
router.delete('/restaurants/:restaurantId', idValidation, SuperAdminController.deleteRestaurant);
router.post('/restaurants/:restaurantId/assign-owner', idValidation, SuperAdminController.assignOwner);

// Statistics routes
router.get('/restaurants/stats', SuperAdminController.getRestaurantStats);

export default router; 