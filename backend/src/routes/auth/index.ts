import { Router } from 'express';
import UserController from '../../controllers/UserController';
import auth from '../../middleware/auth';
import { registerValidation, restaurantOwnerValidation, staffByCodeValidation } from '../../middleware/validation';

const router = Router();

router.post('/register', registerValidation, UserController.register);
router.post('/register/restaurant-owner', restaurantOwnerValidation, UserController.registerRestaurantOwner);
router.post('/register/kitchen-staff', registerValidation, UserController.registerKitchenStaff);
router.post('/register/staff-by-code', staffByCodeValidation, UserController.registerStaffByCode);
router.post('/login', UserController.login);
router.get('/me', auth, UserController.getMe);
router.put('/profile', auth, UserController.updateProfile);
router.put('/change-password', auth, UserController.changePassword);
// Add more as needed (logout, refresh, forgot/reset password)

export default router; 