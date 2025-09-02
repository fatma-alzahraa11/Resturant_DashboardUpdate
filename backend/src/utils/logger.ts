import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // Error log file
  new DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  
  // Combined log file
  new DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  
  // HTTP requests log file
  new DailyRotateFile({
    filename: path.join('logs', 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'http',
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Order-specific logging functions
export const logOrderEvent = (orderId: string, event: string, details: any) => {
  logger.info(`Order Event: ${event}`, {
    orderId,
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

export const logKitchenActivity = (userId: string, action: string, orderId: string, details: any) => {
  logger.info(`Kitchen Activity: ${action}`, {
    userId,
    action,
    orderId,
    details,
    timestamp: new Date().toISOString(),
  });
};

export const logCustomerActivity = (customerPhone: string, action: string, details: any) => {
  logger.info(`Customer Activity: ${action}`, {
    customerPhone,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
};

export const logSecurityEvent = (event: string, details: any) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

export const logPerformanceMetric = (metric: string, value: number, context: any) => {
  logger.info(`Performance Metric: ${metric}`, {
    metric,
    value,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logError = (error: Error, context: any = {}) => {
  logger.error(`Error: ${error.message}`, {
    error: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Analytics logging functions
export const logOrderMetrics = (orderId: string, metrics: {
  preparationTime?: number;
  totalItems: number;
  totalValue: number;
  customerSatisfaction?: number;
}) => {
  logger.info(`Order Metrics: ${orderId}`, {
    orderId,
    metrics,
    timestamp: new Date().toISOString(),
  });
};

export const logKitchenPerformance = (restaurantId: string, metrics: {
  averagePrepTime: number;
  ordersCompleted: number;
  ordersCancelled: number;
  efficiency: number;
}) => {
  logger.info(`Kitchen Performance: ${restaurantId}`, {
    restaurantId,
    metrics,
    timestamp: new Date().toISOString(),
  });
};

export const logCustomerSatisfaction = (orderId: string, rating: number, feedback?: string) => {
  logger.info(`Customer Satisfaction: ${orderId}`, {
    orderId,
    rating,
    feedback,
    timestamp: new Date().toISOString(),
  });
};

// WebSocket activity logging
export const logWebSocketEvent = (event: string, socketId: string, details: any) => {
  logger.debug(`WebSocket Event: ${event}`, {
    event,
    socketId,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Rate limiting logging
export const logRateLimitExceeded = (ip: string, endpoint: string) => {
  logger.warn(`Rate Limit Exceeded: ${ip}`, {
    ip,
    endpoint,
    timestamp: new Date().toISOString(),
  });
};

// Database operation logging
export const logDatabaseOperation = (operation: string, collection: string, details: any) => {
  logger.debug(`Database Operation: ${operation}`, {
    operation,
    collection,
    details,
    timestamp: new Date().toISOString(),
  });
};

// API request logging
export const logApiRequest = (method: string, url: string, statusCode: number, responseTime: number, userId?: string) => {
  logger.http(`API Request: ${method} ${url}`, {
    method,
    url,
    statusCode,
    responseTime,
    userId,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
