import { Router } from 'express';
import PublicController, { publicRateLimit, orderRateLimit } from '../../controllers/PublicController';

const router = Router();

// Public menu endpoints (no authentication required)
router.get('/menu/:restaurantId/:storeId', publicRateLimit, PublicController.getMenu);

// Public products and categories for display screen
router.get('/products/:restaurantId', publicRateLimit, PublicController.getProducts);
router.get('/categories/:restaurantId', publicRateLimit, PublicController.getCategories);
router.get('/discounts/:restaurantId', publicRateLimit, PublicController.getActiveDiscounts);

// QR code validation
router.get('/qr/validate/:qrCode', publicRateLimit, PublicController.validateQR);

// Guest order creation (with rate limiting)
router.post('/orders', orderRateLimit, PublicController.createGuestOrder);

// Public order status tracking
router.get('/orders/:orderId/status', publicRateLimit, PublicController.getOrderStatus);

// Restaurant info by code
router.get('/restaurant/:code', publicRateLimit, PublicController.getRestaurantByCode);

export default router; 