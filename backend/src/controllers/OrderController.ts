import Order from '../models/Order';
import User from '../models/User';
import Table from '../models/Table';
import notificationService from '../services/notificationService';
import { 
  validateRequest, 
  validateOrderStatusTransition, 
  sanitizeInput 
} from '../utils/validators';
import { 
  logOrderEvent, 
  logKitchenActivity, 
  logCustomerActivity, 
  logOrderMetrics,
  logKitchenPerformance,
  logError 
} from '../utils/logger';
import { createOrderSchema, updateOrderStatusSchema, bulkOrderStatusSchema } from '../utils/validators';

export default {
  create: async (req: any, res: any) => {
    try {
      const order = new Order(req.body);
      await order.save();
      
      // Log order creation
      logOrderEvent((order as any)._id.toString(), 'created', {
        restaurantId: order.restaurantId,
        storeId: order.storeId,
        orderType: order.orderType,
        totalItems: order.items.length,
        totalValue: order.totals.total
      });
      
      // Send real-time notification to kitchen
      notificationService.notifyNewOrder(order);
      
      res.status(201).json(order);
    } catch (err: any) {
      logError(err, { context: 'Order creation', body: req.body });
      res.status(400).json({ error: err.message });
    }
  },

  list: async (req: any, res: any) => {
    try {
      const { restaurantId, storeId, status, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      let query: any = {};
      if (restaurantId) query.restaurantId = restaurantId;
      if (storeId) query.storeId = storeId;
      if (status) query.status = status;
      
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('customerId', 'name email phone')
        .populate('assignedTo', 'firstName lastName');
        
      const total = await Order.countDocuments(query);
      
      res.json({
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err: any) {
      logError(err, { context: 'Order listing', query: req.query });
      res.status(500).json({ error: err.message });
    }
  },

  get: async (req: any, res: any) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('customerId', 'name email phone')
        .populate('assignedTo', 'firstName lastName');
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (err: any) {
      logError(err, { context: 'Order retrieval', orderId: req.params.id });
      res.status(400).json({ error: err.message });
    }
  },

  update: async (req: any, res: any) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (err: any) {
      logError(err, { context: 'Order update', orderId: req.params.id, body: req.body });
      res.status(400).json({ error: err.message });
    }
  },

  remove: async (req: any, res: any) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json({ message: 'Order deleted' });
    } catch (err: any) {
      logError(err, { context: 'Order deletion', orderId: req.params.id });
      res.status(400).json({ error: err.message });
    }
  },

  // Enhanced status update with validation
  updateStatus: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { status, assignedTo, estimatedTime, notes, cancellationReason } = req.body;
      const user = req.user;
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check if user has permission to update this order
      if (user.role !== 'super_admin' && 
          user.restaurantId?.toString() !== order.restaurantId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Validate status transition
      if (!validateOrderStatusTransition(order.status, status)) {
        return res.status(400).json({ 
          error: `Invalid status transition from ${order.status} to ${status}`,
          currentStatus: order.status,
          validTransitions: getValidTransitions(order.status)
        });
      }
      
      // Validate cancellation reason if cancelling
      if (status === 'cancelled' && !cancellationReason) {
        return res.status(400).json({ 
          error: 'Cancellation reason is required when cancelling an order' 
        });
      }
      
      const previousStatus = order.status;
      
      // Update order
      order.status = status;
      if (assignedTo) order.assignedTo = assignedTo;
      if (estimatedTime) order.estimatedTime = new Date(estimatedTime);
      if (notes) order.internalNotes = sanitizeInput(notes);
      
      // Set actual time for completed orders
      if (status === 'served' || status === 'delivered') {
        order.actualTime = new Date();
      }
      
      await order.save();
      
      // Log kitchen activity
      logKitchenActivity(user.userId || 'unknown', 'status_update', (order as any)._id.toString(), {
        previousStatus,
        newStatus: status,
        assignedTo,
        estimatedTime
      });
      
      // Log order event
      logOrderEvent((order as any)._id.toString(), 'status_updated', {
        previousStatus,
        newStatus: status,
        updatedBy: user.userId || 'unknown'
      });
      
      // Send real-time notification for status change
      notificationService.notifyStatusUpdate(order, previousStatus);
      
      // Send specific notification for ready orders
      if (status === 'ready') {
        notificationService.notifyOrderReady(order);
      }
      
      // Free table if order is completed or cancelled
      if ((status === 'served' || status === 'cancelled') && order.tableNumber) {
        const table = await Table.findOne({ 
          storeId: order.storeId, 
          tableNumber: order.tableNumber 
        });
        if (table) {
          table.free();
          await table.save();
        }
      }
      
      res.json({ 
        message: 'Order status updated successfully',
        order 
      });
    } catch (err: any) {
      logError(err, { 
        context: 'Order status update', 
        orderId: req.params.id, 
        body: req.body 
      });
      res.status(500).json({ error: err.message });
    }
  },

  // Bulk order status updates
  bulkUpdateStatus: async (req: any, res: any) => {
    try {
      const { orderIds, status, assignedTo, notes } = req.body;
      const user = req.user;
      
      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({ error: 'Order IDs array is required' });
      }
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      // Validate status for bulk update
      const validBulkStatuses = ['confirmed', 'preparing', 'ready', 'cancelled'];
      if (!validBulkStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `Invalid status for bulk update. Valid statuses: ${validBulkStatuses.join(', ')}` 
        });
      }
      
      const results = [];
      const errors = [];
      
      for (const orderId of orderIds) {
        try {
          const order = await Order.findById(orderId);
          if (!order) {
            errors.push(`Order ${orderId} not found`);
            continue;
          }
          
          // Check permissions
          if (user.role !== 'super_admin' && 
              user.restaurantId?.toString() !== order.restaurantId?.toString()) {
            errors.push(`Access denied to order ${orderId}`);
            continue;
          }
          
          // Validate status transition
          if (!validateOrderStatusTransition(order.status, status)) {
            errors.push(`Invalid status transition for order ${orderId}: ${order.status} → ${status}`);
            continue;
          }
          
          // Update order
          order.status = status;
          if (assignedTo) order.assignedTo = assignedTo;
          if (notes) order.internalNotes = sanitizeInput(notes);
          
          await order.save();
          
                     // Log activity
           logKitchenActivity(user.userId || 'unknown', 'bulk_status_update', (order as any)._id.toString(), {
             newStatus: status,
             assignedTo
           });
          
          results.push({
            orderId,
            status: 'updated',
            previousStatus: order.status,
            newStatus: status
          });
          
        } catch (error) {
          errors.push(`Failed to update order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      // Send notifications for updated orders
      if (results.length > 0) {
        notificationService.broadcast({
          type: 'bulk_status_update',
          orderIds: results.map(r => r.orderId),
          restaurantId: user.restaurantId || 'unknown',
          status,
          message: `Bulk status update: ${results.length} orders updated to ${status}`,
          timestamp: new Date()
        });
      }
      
      res.json({
        message: `Bulk update completed: ${results.length} updated, ${errors.length} failed`,
        results,
        errors: errors.length > 0 ? errors : undefined
      });
      
    } catch (err: any) {
      logError(err, { context: 'Bulk order status update', body: req.body });
      res.status(500).json({ error: err.message });
    }
  },

  // Cancel order with reason
  cancelOrder: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { reason, refundAmount } = req.body;
      const user = req.user;
      
      if (!reason) {
        return res.status(400).json({ error: 'Cancellation reason is required' });
      }
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check permissions
      if (user.role !== 'super_admin' && 
          user.restaurantId?.toString() !== order.restaurantId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Check if order can be cancelled
      const cancellableStatuses = ['pending', 'confirmed', 'preparing'];
      if (!cancellableStatuses.includes(order.status)) {
        return res.status(400).json({ 
          error: `Order cannot be cancelled in ${order.status} status`,
          cancellableStatuses 
        });
      }
      
      const previousStatus = order.status;
      
      // Update order
      order.status = 'cancelled';
      order.internalNotes = `Cancelled by ${user.firstName || 'unknown'}: ${sanitizeInput(reason)}`;
      order.actualTime = new Date();
      
      // Handle refund if specified
      if (refundAmount && refundAmount > 0) {
        order.payment.status = 'refunded';
        order.payment.gatewayResponse = {
          refundAmount,
          refundReason: reason,
          refundedAt: new Date()
        };
      }
      
      await order.save();
      
      // Free table if dine-in order
      if (order.tableNumber) {
        const table = await Table.findOne({ 
          storeId: order.storeId, 
          tableNumber: order.tableNumber 
        });
        if (table) {
          table.free();
          await table.save();
        }
      }
      
      // Log activities
      logKitchenActivity(user.userId || 'unknown', 'order_cancelled', (order as any)._id.toString(), {
        reason,
        refundAmount
      });
      
      logOrderEvent((order as any)._id.toString(), 'cancelled', {
        reason,
        cancelledBy: user.userId || 'unknown',
        refundAmount
      });
      
      // Send notification
      notificationService.notifyOrderCancelled(order);
      
      res.json({ 
        message: 'Order cancelled successfully',
        order 
      });
      
    } catch (err: any) {
      logError(err, { 
        context: 'Order cancellation', 
        orderId: req.params.id, 
        body: req.body 
      });
      res.status(500).json({ error: err.message });
    }
  },

  getReceipt: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      
      const order = await Order.findById(id)
        .populate('customerId', 'name email phone')
        .populate('restaurantId', 'name address contact');
        
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const receipt = {
        orderNumber: order.orderNumber,
        date: order.createdAt,
        customer: order.customerInfo,
        items: order.items,
        totals: order.totals,
        payment: order.payment,
        restaurant: order.restaurantId,
        status: order.status,
        estimatedTime: order.estimatedTime,
        notes: order.customerNotes
      };
      
      res.json(receipt);
    } catch (err: any) {
      logError(err, { context: 'Receipt generation', orderId: req.params.id });
      res.status(500).json({ error: err.message });
    }
  },

  // Customer order tracking (public endpoint)
  getOrderStatus: async (req: any, res: any) => {
    try {
      const { orderId } = req.params;
      
      const order = await Order.findById(orderId)
        .select('orderNumber status estimatedTime createdAt customerInfo items totals');
        
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Log customer activity
      logCustomerActivity(order.customerInfo.phone, 'check_order_status', {
        orderId,
        orderNumber: order.orderNumber,
        status: order.status
      });
      
      res.json({
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedTime: order.estimatedTime,
        createdAt: order.createdAt,
        customer: order.customerInfo,
        items: order.items,
        totals: order.totals
      });
      
    } catch (err: any) {
      logError(err, { context: 'Customer order status check', orderId: req.params.orderId });
      res.status(500).json({ error: 'Failed to retrieve order status' });
    }
  },

  // Customer order history (authenticated)
  getCustomerOrders: async (req: any, res: any) => {
    try {
      const { phone } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      
      const orders = await Order.find({
        'customerInfo.phone': phone
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('orderNumber status createdAt totals customerInfo items');
      
      const total = await Order.countDocuments({
        'customerInfo.phone': phone
      });
      
      logCustomerActivity(phone, 'view_order_history', {
        totalOrders: total,
        requestedPage: page
      });
      
      res.json({
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } catch (err: any) {
      logError(err, { context: 'Customer order history', phone: req.params.phone });
      res.status(500).json({ error: 'Failed to retrieve order history' });
    }
  },

  // Kitchen-specific endpoints
  getPendingOrders: async (req: any, res: any) => {
    try {
      const user = req.user;
      let query: any = {
        status: { $in: ['pending', 'confirmed', 'preparing'] }
      };
      
      // Filter by restaurant if user is not super admin
      if (user.role !== 'super_admin') {
        query.restaurantId = user.restaurantId;
      }
      
      const orders = await Order.find(query)
        .sort({ createdAt: 1 })
        .populate('customerId', 'name phone')
        .populate('assignedTo', 'firstName lastName');
        
      res.json(orders);
    } catch (err: any) {
      logError(err, { context: 'Get pending orders', user: req.user });
      res.status(500).json({ error: err.message });
    }
  },

  getRestaurantOrders: async (req: any, res: any) => {
    try {
      const { restaurantId } = req.params;
      const { status, today } = req.query;
      
      let query: any = { restaurantId };
      
      if (status) {
        query.status = status;
      }
      
      if (today === 'true') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: todayStart, $lte: todayEnd };
      }
      
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .populate('customerId', 'name phone')
        .populate('assignedTo', 'firstName lastName');
        
      res.json(orders);
    } catch (err: any) {
      logError(err, { context: 'Get restaurant orders', restaurantId: req.params.restaurantId });
      res.status(500).json({ error: err.message });
    }
  },

  startPreparation: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { assignedTo, estimatedTime } = req.body;
      const user = req.user;
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check permissions
      if (user.role !== 'super_admin' && 
          user.restaurantId?.toString() !== order.restaurantId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Update order status to preparing
      order.status = 'preparing';
      order.assignedTo = assignedTo || user.userId;
      if (estimatedTime) {
        order.estimatedTime = new Date(estimatedTime);
      }
      
      await order.save();
      
      // Log kitchen activity
      logKitchenActivity(user.userId || 'unknown', 'start_preparation', (order as any)._id.toString(), {
        assignedTo,
        estimatedTime
      });
      
      // Send notification
      notificationService.notifyStatusUpdate(order, 'confirmed');
      
      res.json({ 
        message: 'Order preparation started',
        order 
      });
    } catch (err: any) {
      logError(err, { context: 'Start preparation', orderId: req.params.id });
      res.status(500).json({ error: err.message });
    }
  },

  markReady: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check permissions
      if (user.role !== 'super_admin' && 
          user.restaurantId?.toString() !== order.restaurantId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Update order status to ready
      order.status = 'ready';
      
      await order.save();
      
      // Log kitchen activity
      logKitchenActivity(user.userId || 'unknown', 'mark_ready', (order as any)._id.toString(), {});
      
      // Send notification
      notificationService.notifyOrderReady(order);
      
      res.json({ 
        message: 'Order marked as ready',
        order 
      });
    } catch (err: any) {
      logError(err, { context: 'Mark ready', orderId: req.params.id });
      res.status(500).json({ error: err.message });
    }
  },

  getKitchenStats: async (req: any, res: any) => {
    try {
      const user = req.user;
      let query: any = {};
      
      if (user.role !== 'super_admin') {
        query.restaurantId = user.restaurantId;
      }
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      query.createdAt = { $gte: todayStart, $lt: todayEnd };
      
      const stats = await Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$totals.total' }
          }
        }
      ]);
      
      const totalOrders = await Order.countDocuments(query);
      const pendingOrders = await Order.countDocuments({
        ...query,
        status: { $in: ['pending', 'confirmed', 'preparing'] }
      });
      
      // Calculate performance metrics
      const completedOrders = await Order.find({
        ...query,
        status: { $in: ['served', 'delivered'] }
      });
      
      const avgPrepTime = completedOrders.length > 0 
        ? completedOrders.reduce((total, order) => {
            const prepTime = order.actualTime && order.createdAt 
              ? (order.actualTime.getTime() - order.createdAt.getTime()) / (1000 * 60)
              : 0;
            return total + prepTime;
          }, 0) / completedOrders.length
        : 0;
      
      // Log kitchen performance
      logKitchenPerformance(user.restaurantId || 'unknown', {
        averagePrepTime: avgPrepTime,
        ordersCompleted: completedOrders.length,
        ordersCancelled: stats.find(s => s._id === 'cancelled')?.count || 0,
        efficiency: totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0
      });
      
      res.json({
        today: {
          total: totalOrders,
          pending: pendingOrders,
          byStatus: stats,
          performance: {
            averagePrepTime: Math.round(avgPrepTime),
            completionRate: totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 0
          }
        }
      });
    } catch (err: any) {
      logError(err, { context: 'Get kitchen stats', user: req.user });
      res.status(500).json({ error: err.message });
    }
  }
};

// Helper function to get valid status transitions
function getValidTransitions(currentStatus: string): string[] {
  const validTransitions: { [key: string]: string[] } = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['served', 'delivered'],
    'served': [],
    'delivered': [],
    'cancelled': []
  };
  
  return validTransitions[currentStatus] || [];
} 