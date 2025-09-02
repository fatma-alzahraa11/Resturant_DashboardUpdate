import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { logWebSocketEvent, logKitchenActivity, logCustomerActivity, logSecurityEvent } from '../utils/logger';

// Simple UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface OrderNotification {
  type: 'new_order' | 'status_update' | 'order_ready' | 'order_cancelled' | 'bulk_status_update';
  orderId?: string;
  orderIds?: string[];
  orderNumber?: string;
  restaurantId: string;
  status: string;
  message: string;
  timestamp: Date;
}

interface CustomerConnection {
  socketId: string;
  orderId: string;
  restaurantId: string;
  sessionId: string;
  socket: any;
  lastActivity: Date;
}

interface StaffConnection {
  socketId: string;
  userId: string;
  restaurantId: string;
  role: string;
  sessionId: string;
  socket: any;
  lastActivity: Date;
}

class NotificationService {
  private io: Server | null = null;
  private connectedClients: Map<string, StaffConnection> = new Map();
  private customerConnections: Map<string, CustomerConnection> = new Map();
  private sessions: Map<string, { userId: string; restaurantId: string; role: string; lastActivity: Date }> = new Map();

  initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.on('connection', (socket) => {
      logWebSocketEvent('connection', socket.id, {});
      
      // Handle kitchen staff authentication with JWT
      socket.on('authenticate', async (data: { token: string, restaurantId: string }) => {
        try {
          // Verify JWT token
          const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
          const decoded = jwt.verify(data.token, secret, { algorithms: ['HS256'] }) as any;
          
          if (!decoded || !decoded.userId || !decoded.restaurantId) {
            logSecurityEvent('Invalid JWT in WebSocket authentication', { socketId: socket.id });
            socket.emit('authentication_error', { message: 'Invalid token' });
            return;
          }

          // Check if user has access to this restaurant
          if (decoded.restaurantId !== data.restaurantId && decoded.role !== 'super_admin') {
            logSecurityEvent('Unauthorized restaurant access attempt', { 
              socketId: socket.id, 
              userId: decoded.userId, 
              requestedRestaurant: data.restaurantId 
            });
            socket.emit('authentication_error', { message: 'Access denied to this restaurant' });
            return;
          }

          // Create session
          const sessionId = generateUUID();
          this.sessions.set(sessionId, {
            userId: decoded.userId,
            restaurantId: data.restaurantId,
            role: decoded.role,
            lastActivity: new Date()
          });

          // Join restaurant room
          socket.join(`restaurant_${data.restaurantId}`);
          
          // Store connection info
          this.connectedClients.set(socket.id, {
            socketId: socket.id,
            userId: decoded.userId,
            restaurantId: data.restaurantId,
            role: decoded.role,
            sessionId,
            socket,
            lastActivity: new Date()
          });

          logKitchenActivity(decoded.userId, 'authenticated', '', { 
            restaurantId: data.restaurantId, 
            socketId: socket.id 
          });

          socket.emit('authenticated', { 
            sessionId, 
            restaurantId: data.restaurantId,
            role: decoded.role 
          });

          console.log(`Kitchen staff authenticated for restaurant: ${data.restaurantId}`);
        } catch (error) {
          logSecurityEvent('JWT verification failed in WebSocket', { 
            socketId: socket.id, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          socket.emit('authentication_error', { message: 'Token verification failed' });
        }
      });

      // Handle customer authentication for order tracking
      socket.on('track_order', (data: { orderId: string, orderNumber: string }) => {
        socket.join(`order_${data.orderId}`);
        const sessionId = generateUUID();
        
        this.customerConnections.set(socket.id, {
          socketId: socket.id,
          orderId: data.orderId,
          restaurantId: '', // Will be set when order is found
          sessionId,
          socket,
          lastActivity: new Date()
        });

        logCustomerActivity('unknown', 'track_order', { 
          orderId: data.orderId, 
          orderNumber: data.orderNumber,
          socketId: socket.id 
        });

        console.log(`Customer tracking order: ${data.orderNumber}`);
      });

      // Handle customer authentication for restaurant
      socket.on('customer_authenticate', (data: { restaurantId: string, orderId?: string }) => {
        socket.join(`restaurant_${data.restaurantId}`);
        if (data.orderId) {
          socket.join(`order_${data.orderId}`);
        }

        const sessionId = generateUUID();
        this.customerConnections.set(socket.id, {
          socketId: socket.id,
          orderId: data.orderId || '',
          restaurantId: data.restaurantId,
          sessionId,
          socket,
          lastActivity: new Date()
        });

        logCustomerActivity('unknown', 'customer_authenticate', { 
          restaurantId: data.restaurantId, 
          orderId: data.orderId,
          socketId: socket.id 
        });

        console.log(`Customer authenticated for restaurant: ${data.restaurantId}`);
      });

      // Handle staff activity logging
      socket.on('kitchen_action', (data: { action: string; orderId: string; details: any }) => {
        const connection = this.connectedClients.get(socket.id);
        if (connection) {
          logKitchenActivity(connection.userId, data.action, data.orderId, data.details);
        }
      });

      // Handle heartbeat
      socket.on('heartbeat', () => {
        const connection = this.connectedClients.get(socket.id);
        if (connection) {
          connection.lastActivity = new Date();
          const session = this.sessions.get(connection.sessionId);
          if (session) {
            session.lastActivity = new Date();
          }
        }

        const customerConnection = this.customerConnections.get(socket.id);
        if (customerConnection) {
          customerConnection.lastActivity = new Date();
        }
      });

      socket.on('disconnect', () => {
        logWebSocketEvent('disconnect', socket.id, {});
        
        // Clean up staff connection
        const staffConnection = this.connectedClients.get(socket.id);
        if (staffConnection) {
          logKitchenActivity(staffConnection.userId, 'disconnected', '', { socketId: socket.id });
          this.connectedClients.delete(socket.id);
          this.sessions.delete(staffConnection.sessionId);
        }

        // Clean up customer connection
        const customerConnection = this.customerConnections.get(socket.id);
        if (customerConnection) {
          logCustomerActivity('unknown', 'disconnected', { socketId: socket.id });
          this.customerConnections.delete(socket.id);
        }

        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    // Clean up inactive sessions every 5 minutes
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000);

    console.log('Notification service initialized with enhanced security');
  }

  // Clean up inactive sessions
  private cleanupInactiveSessions() {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    // Clean up staff sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > inactiveThreshold) {
        this.sessions.delete(sessionId);
        
        // Find and disconnect associated socket
        for (const [socketId, connection] of this.connectedClients.entries()) {
          if (connection.sessionId === sessionId) {
            connection.socket.disconnect();
            this.connectedClients.delete(socketId);
            break;
          }
        }
      }
    }

    // Clean up customer connections
    for (const [socketId, connection] of this.customerConnections.entries()) {
      if (now.getTime() - connection.lastActivity.getTime() > inactiveThreshold) {
        connection.socket.disconnect();
        this.customerConnections.delete(socketId);
      }
    }
  }

  // Send notification to specific restaurant
  sendToRestaurant(restaurantId: string, notification: OrderNotification) {
    if (this.io) {
      this.io.to(`restaurant_${restaurantId}`).emit('order_notification', notification);
      console.log(`Notification sent to restaurant ${restaurantId}:`, notification);
    }
  }

  // Send notification to specific order (for customers)
  sendToOrder(orderId: string, notification: OrderNotification) {
    if (this.io) {
      this.io.to(`order_${orderId}`).emit('order_update', notification);
      console.log(`Notification sent to order ${orderId}:`, notification);
    }
  }

  // Send notification to all connected clients
  broadcast(notification: OrderNotification) {
    if (this.io) {
      this.io.emit('order_notification', notification);
      console.log('Broadcast notification sent:', notification);
    }
  }

  // Notify about new order
  notifyNewOrder(order: any) {
    const notification: OrderNotification = {
      type: 'new_order',
      orderId: order._id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      status: order.status,
      message: `New order received: ${order.orderNumber}`,
      timestamp: new Date()
    };
    
    this.sendToRestaurant(order.restaurantId, notification);
  }

  // Notify about status update
  notifyStatusUpdate(order: any, previousStatus: string) {
    const notification: OrderNotification = {
      type: 'status_update',
      orderId: order._id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      status: order.status,
      message: `Order ${order.orderNumber} status changed from ${previousStatus} to ${order.status}`,
      timestamp: new Date()
    };
    
    this.sendToRestaurant(order.restaurantId, notification);
    this.sendToOrder(order._id, notification);
  }

  // Notify when order is ready
  notifyOrderReady(order: any) {
    const notification: OrderNotification = {
      type: 'order_ready',
      orderId: order._id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      status: order.status,
      message: `Order ${order.orderNumber} is ready for pickup!`,
      timestamp: new Date()
    };
    
    this.sendToRestaurant(order.restaurantId, notification);
    this.sendToOrder(order._id, notification);
  }

  // Notify about cancelled order
  notifyOrderCancelled(order: any) {
    const notification: OrderNotification = {
      type: 'order_cancelled',
      orderId: order._id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurantId,
      status: order.status,
      message: `Order ${order.orderNumber} has been cancelled`,
      timestamp: new Date()
    };
    
    this.sendToRestaurant(order.restaurantId, notification);
    this.sendToOrder(order._id, notification);
  }

  // Send custom notification to customers
  notifyCustomer(orderId: string, message: string, type: string = 'info') {
    if (this.io) {
      this.io.to(`order_${orderId}`).emit('customer_notification', {
        type,
        message,
        timestamp: new Date()
      });
    }
  }

  // Send estimated time update to customers
  notifyEstimatedTimeUpdate(orderId: string, estimatedTime: Date) {
    if (this.io) {
      this.io.to(`order_${orderId}`).emit('estimated_time_update', {
        estimatedTime,
        timestamp: new Date()
      });
    }
  }

  // Get connected clients count for a restaurant
  getConnectedClientsCount(restaurantId: string): number {
    if (!this.io) return 0;
    
    const room = this.io.sockets.adapter.rooms.get(`restaurant_${restaurantId}`);
    return room ? room.size : 0;
  }

  // Get customer connections count for an order
  getCustomerConnectionsCount(orderId: string): number {
    if (!this.io) return 0;
    
    const room = this.io.sockets.adapter.rooms.get(`order_${orderId}`);
    return room ? room.size : 0;
  }

  // Get all connected clients info
  getConnectedClients() {
    return Array.from(this.connectedClients.values()).map(connection => ({
      socketId: connection.socketId,
      userId: connection.userId,
      restaurantId: connection.restaurantId,
      role: connection.role,
      lastActivity: connection.lastActivity
    }));
  }

  // Get all customer connections info
  getCustomerConnections() {
    return Array.from(this.customerConnections.values()).map(connection => ({
      socketId: connection.socketId,
      orderId: connection.orderId,
      restaurantId: connection.restaurantId,
      lastActivity: connection.lastActivity
    }));
  }

  // Send order status to specific user
  sendOrderStatus(order: any) {
    if (this.io) {
      this.io.to(`order_${order._id}`).emit('order_status', {
        orderId: order._id,
        status: order.status,
        estimatedTime: order.estimatedTime,
        timestamp: new Date()
      });
    }
  }

  // Force disconnect a specific socket
  disconnectSocket(socketId: string) {
    const socket = this.io?.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect();
      this.connectedClients.delete(socketId);
      this.customerConnections.delete(socketId);
    }
  }

  // Get session info
  getSessionInfo(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  // Validate session
  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const now = new Date();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    if (now.getTime() - session.lastActivity.getTime() > sessionTimeout) {
      this.sessions.delete(sessionId);
      return false;
    }

    session.lastActivity = now;
    return true;
  }
}

export default new NotificationService();
