import Order from '../models/Order';
import Table from '../models/Table';
import { logPerformanceMetric, logKitchenPerformance, logOrderMetrics } from '../utils/logger';
import cron from 'node-cron';

interface PerformanceMetrics {
  averagePrepTime: number;
  orderCompletionRate: number;
  customerSatisfaction: number;
  tableUtilization: number;
  revenuePerHour: number;
  peakHours: string[];
  popularItems: Array<{ itemId: string; name: string; count: number }>;
}

interface KitchenMetrics {
  ordersCompleted: number;
  ordersCancelled: number;
  averagePrepTime: number;
  efficiency: number;
  staffPerformance: Array<{ userId: string; ordersHandled: number; avgPrepTime: number }>;
}

class AnalyticsService {
  private metricsCache: Map<string, { data: any; timestamp: Date }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Schedule daily analytics collection
    cron.schedule('0 0 * * *', () => {
      this.generateDailyAnalytics();
    });

    // Schedule hourly performance monitoring
    cron.schedule('0 * * * *', () => {
      this.monitorHourlyPerformance();
    });

    // Schedule real-time metrics every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.updateRealTimeMetrics();
    });
  }

  // Generate comprehensive analytics for a restaurant
  async generateRestaurantAnalytics(restaurantId: string, dateFrom: Date, dateTo: Date): Promise<PerformanceMetrics> {
    try {
      const cacheKey = `restaurant_${restaurantId}_${dateFrom.toISOString()}_${dateTo.toISOString()}`;
      const cached = this.metricsCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp.getTime()) < this.cacheTimeout) {
        return cached.data;
      }

      // Get orders for the period
      const orders = await Order.find({
        restaurantId,
        createdAt: { $gte: dateFrom, $lte: dateTo }
      }).populate('items.productId');

      // Calculate metrics
      const completedOrders = orders.filter(o => ['served', 'delivered'].includes(o.status));
      const cancelledOrders = orders.filter(o => o.status === 'cancelled');
      
      // Average preparation time
      const avgPrepTime = completedOrders.length > 0 
        ? completedOrders.reduce((total, order) => {
            const prepTime = order.actualTime && order.createdAt 
              ? (order.actualTime.getTime() - order.createdAt.getTime()) / (1000 * 60)
              : 0;
            return total + prepTime;
          }, 0) / completedOrders.length
        : 0;

      // Order completion rate
      const completionRate = orders.length > 0 
        ? (completedOrders.length / orders.length) * 100 
        : 0;

      // Revenue per hour
      const hourlyRevenue = this.calculateHourlyRevenue(orders);
      const revenuePerHour = hourlyRevenue.reduce((total, revenue) => total + revenue, 0) / 24;

      // Peak hours
      const peakHours = this.identifyPeakHours(orders);

      // Popular items
      const popularItems = this.getPopularItems(orders);

      // Table utilization
      const tableUtilization = await this.calculateTableUtilization(restaurantId, dateFrom, dateTo);

      const metrics: PerformanceMetrics = {
        averagePrepTime: Math.round(avgPrepTime),
        orderCompletionRate: Math.round(completionRate),
        customerSatisfaction: 0, // Would come from feedback system
        tableUtilization: tableUtilization,
        revenuePerHour: Math.round(revenuePerHour),
        peakHours,
        popularItems
      };

      // Cache the results
      this.metricsCache.set(cacheKey, {
        data: metrics,
        timestamp: new Date()
      });

      // Log performance metrics
      logPerformanceMetric('restaurant_analytics', completionRate, {
        restaurantId,
        period: `${dateFrom.toISOString()} to ${dateTo.toISOString()}`,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        cancelledOrders: cancelledOrders.length
      });

      return metrics;
    } catch (error) {
      console.error('Error generating restaurant analytics:', error);
      throw error;
    }
  }

  // Generate kitchen performance metrics
  async generateKitchenMetrics(restaurantId: string, dateFrom: Date, dateTo: Date): Promise<KitchenMetrics> {
    try {
      const orders = await Order.find({
        restaurantId,
        createdAt: { $gte: dateFrom, $lte: dateTo }
      }).populate('assignedTo');

      const completedOrders = orders.filter(o => ['served', 'delivered'].includes(o.status));
      const cancelledOrders = orders.filter(o => o.status === 'cancelled');

      // Calculate average preparation time
      const avgPrepTime = completedOrders.length > 0 
        ? completedOrders.reduce((total, order) => {
            const prepTime = order.actualTime && order.createdAt 
              ? (order.actualTime.getTime() - order.createdAt.getTime()) / (1000 * 60)
              : 0;
            return total + prepTime;
          }, 0) / completedOrders.length
        : 0;

      // Calculate efficiency
      const efficiency = orders.length > 0 
        ? (completedOrders.length / orders.length) * 100 
        : 0;

      // Staff performance
      const staffPerformance = this.calculateStaffPerformance(completedOrders);

      const metrics: KitchenMetrics = {
        ordersCompleted: completedOrders.length,
        ordersCancelled: cancelledOrders.length,
        averagePrepTime: Math.round(avgPrepTime),
        efficiency: Math.round(efficiency),
        staffPerformance
      };

      // Log kitchen performance
      logKitchenPerformance(restaurantId, metrics);

      return metrics;
    } catch (error) {
      console.error('Error generating kitchen metrics:', error);
      throw error;
    }
  }

  // Monitor real-time order processing
  async monitorRealTimeOrders(restaurantId: string): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const recentOrders = await Order.find({
        restaurantId,
        createdAt: { $gte: oneHourAgo }
      });

      const pendingOrders = recentOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));
      const completedOrders = recentOrders.filter(o => ['served', 'delivered'].includes(o.status));

      const metrics = {
        totalOrders: recentOrders.length,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        averageWaitTime: this.calculateAverageWaitTime(pendingOrders),
        estimatedCompletionTime: this.estimateCompletionTime(pendingOrders)
      };

      // Log real-time metrics
      logPerformanceMetric('real_time_orders', metrics.totalOrders, {
        restaurantId,
        pendingOrders: metrics.pendingOrders,
        completedOrders: metrics.completedOrders
      });

      return metrics;
    } catch (error) {
      console.error('Error monitoring real-time orders:', error);
      throw error;
    }
  }

  // Generate daily analytics
  private async generateDailyAnalytics(): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all restaurants
      const restaurants = await Order.distinct('restaurantId');

      for (const restaurantId of restaurants) {
        try {
          const analytics = await this.generateRestaurantAnalytics(restaurantId, yesterday, today);
          const kitchenMetrics = await this.generateKitchenMetrics(restaurantId, yesterday, today);

          // Log daily summary
          logPerformanceMetric('daily_analytics', analytics.orderCompletionRate, {
            restaurantId,
            date: yesterday.toISOString().split('T')[0],
            totalOrders: analytics.orderCompletionRate,
            kitchenEfficiency: kitchenMetrics.efficiency
          });
        } catch (error) {
          console.error(`Error generating daily analytics for restaurant ${restaurantId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error generating daily analytics:', error);
    }
  }

  // Monitor hourly performance
  private async monitorHourlyPerformance(): Promise<void> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const restaurants = await Order.distinct('restaurantId');

      for (const restaurantId of restaurants) {
        try {
          const metrics = await this.monitorRealTimeOrders(restaurantId);
          
          // Alert if too many pending orders
          if (metrics.pendingOrders > 10) {
            logPerformanceMetric('high_pending_orders_alert', metrics.pendingOrders, {
              restaurantId,
              timestamp: now.toISOString()
            });
          }

          // Alert if average wait time is too high
          if (metrics.averageWaitTime > 30) {
            logPerformanceMetric('high_wait_time_alert', metrics.averageWaitTime, {
              restaurantId,
              timestamp: now.toISOString()
            });
          }
        } catch (error) {
          console.error(`Error monitoring hourly performance for restaurant ${restaurantId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error monitoring hourly performance:', error);
    }
  }

  // Update real-time metrics
  private async updateRealTimeMetrics(): Promise<void> {
    try {
      const restaurants = await Order.distinct('restaurantId');

      for (const restaurantId of restaurants) {
        try {
          await this.monitorRealTimeOrders(restaurantId);
        } catch (error) {
          console.error(`Error updating real-time metrics for restaurant ${restaurantId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error updating real-time metrics:', error);
    }
  }

  // Helper methods
  private calculateHourlyRevenue(orders: any[]): number[] {
    const hourlyRevenue = new Array(24).fill(0);
    
    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      hourlyRevenue[hour] += order.totals.total;
    });

    return hourlyRevenue;
  }

  private identifyPeakHours(orders: any[]): string[] {
    const hourlyCount = new Array(24).fill(0);
    
    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      hourlyCount[hour]++;
    });

    const maxCount = Math.max(...hourlyCount);
    const peakHours = hourlyCount
      .map((count, hour) => ({ count, hour }))
      .filter(({ count }) => count >= maxCount * 0.8)
      .map(({ hour }) => `${hour}:00`);

    return peakHours;
  }

  private getPopularItems(orders: any[]): Array<{ itemId: string; name: string; count: number }> {
    const itemCounts = new Map<string, { name: string; count: number }>();

    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const itemId = item.productId.toString();
        const current = itemCounts.get(itemId) || { name: item.name, count: 0 };
        current.count += item.quantity;
        itemCounts.set(itemId, current);
      });
    });

    return Array.from(itemCounts.entries())
      .map(([itemId, data]) => ({ itemId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private async calculateTableUtilization(restaurantId: string, dateFrom: Date, dateTo: Date): Promise<number> {
    try {
      const tables = await Table.find({ restaurantId });
      const totalTables = tables.length;

      if (totalTables === 0) return 0;

      const occupiedTables = tables.filter(table => table.status.isOccupied).length;
      return Math.round((occupiedTables / totalTables) * 100);
    } catch (error) {
      console.error('Error calculating table utilization:', error);
      return 0;
    }
  }

  private calculateStaffPerformance(orders: any[]): Array<{ userId: string; ordersHandled: number; avgPrepTime: number }> {
    const staffPerformance = new Map<string, { ordersHandled: number; totalPrepTime: number }>();

    orders.forEach(order => {
      if (order.assignedTo) {
        const userId = order.assignedTo.toString();
        const current = staffPerformance.get(userId) || { ordersHandled: 0, totalPrepTime: 0 };
        
        current.ordersHandled++;
        if (order.actualTime && order.createdAt) {
          const prepTime = (order.actualTime.getTime() - order.createdAt.getTime()) / (1000 * 60);
          current.totalPrepTime += prepTime;
        }
        
        staffPerformance.set(userId, current);
      }
    });

    return Array.from(staffPerformance.entries()).map(([userId, data]) => ({
      userId,
      ordersHandled: data.ordersHandled,
      avgPrepTime: Math.round(data.totalPrepTime / data.ordersHandled)
    }));
  }

  private calculateAverageWaitTime(orders: any[]): number {
    if (orders.length === 0) return 0;

    const totalWaitTime = orders.reduce((total, order) => {
      const waitTime = order.createdAt 
        ? (Date.now() - order.createdAt.getTime()) / (1000 * 60)
        : 0;
      return total + waitTime;
    }, 0);

    return Math.round(totalWaitTime / orders.length);
  }

  private estimateCompletionTime(orders: any[]): Date {
    if (orders.length === 0) return new Date();

    const avgPrepTime = 20; // minutes - could be calculated from historical data
    const estimatedMinutes = orders.length * avgPrepTime;
    
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + estimatedMinutes);
    
    return estimatedTime;
  }

  // Clear cache
  clearCache(): void {
    this.metricsCache.clear();
  }

  // Get cached metrics
  getCachedMetrics(key: string): any | null {
    const cached = this.metricsCache.get(key);
    if (cached && (Date.now() - cached.timestamp.getTime()) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
}

export default new AnalyticsService();
