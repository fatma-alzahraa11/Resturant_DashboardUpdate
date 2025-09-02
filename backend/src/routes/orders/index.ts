import { Router } from 'express';
import OrderController from '../../controllers/OrderController';
import auth from '../../middleware/auth';
import { validateRequest, validateParams } from '../../utils/validators';
import { 
  createOrderSchema, 
  updateOrderStatusSchema, 
  bulkOrderStatusSchema 
} from '../../utils/validators';
import { 
  orderRateLimiter, 
  customerRateLimiter, 
  kitchenRateLimiter,
  orderSlowDown 
} from '../../middleware/rateLimiter';

const router = Router();

// Standard order endpoints (authenticated)
router.post('/', auth, orderRateLimiter, orderSlowDown, validateRequest(createOrderSchema), OrderController.create);
router.get('/', auth, OrderController.list);
router.get('/:id', auth, OrderController.get);
router.put('/:id', auth, OrderController.update);
router.delete('/:id', auth, OrderController.remove);

// Enhanced status management
router.put('/:id/status', auth, kitchenRateLimiter, validateRequest(updateOrderStatusSchema), OrderController.updateStatus);
router.put('/:id/cancel', auth, kitchenRateLimiter, OrderController.cancelOrder);

// Bulk operations
router.put('/bulk/status', auth, kitchenRateLimiter, validateRequest(bulkOrderStatusSchema), OrderController.bulkUpdateStatus);

// Receipt generation
router.get('/:id/receipt', auth, OrderController.getReceipt);

// Customer order tracking (public)
router.get('/status/:orderId', customerRateLimiter, OrderController.getOrderStatus);
router.get('/customer/:phone', customerRateLimiter, OrderController.getCustomerOrders);

// Kitchen-specific endpoints
router.get('/kitchen/pending', auth, kitchenRateLimiter, OrderController.getPendingOrders);
router.get('/kitchen/stats', auth, kitchenRateLimiter, OrderController.getKitchenStats);
router.get('/kitchen/restaurant/:restaurantId', auth, kitchenRateLimiter, OrderController.getRestaurantOrders);
router.put('/kitchen/:id/prepare', auth, kitchenRateLimiter, OrderController.startPreparation);
router.put('/kitchen/:id/ready', auth, kitchenRateLimiter, OrderController.markReady);

export default router; 