import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response, NextFunction } from 'express';
import { logRateLimitExceeded, logSecurityEvent } from '../utils/logger';

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logRateLimitExceeded(req.ip || 'unknown', req.path);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Order creation rate limiter (more strict)
export const orderRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 order requests per 5 minutes
  message: {
    error: 'Too many order requests from this IP, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logRateLimitExceeded(req.ip || 'unknown', '/orders');
    res.status(429).json({
      error: 'Too many order requests from this IP, please try again later.',
      retryAfter: '5 minutes'
    });
  }
});

// Customer-specific rate limiter
export const customerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each customer to 50 requests per hour
  keyGenerator: (req: Request) => {
    // Use customer phone number if available, otherwise use IP
    return req.body?.customerInfo?.phone || req.ip || 'unknown';
  },
  message: {
    error: 'Too many requests from this customer, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const customerId = req.body?.customerInfo?.phone || req.ip || 'unknown';
    logRateLimitExceeded(customerId, req.path);
    res.status(429).json({
      error: 'Too many requests from this customer, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

// Authentication rate limiter
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logRateLimitExceeded(req.ip || 'unknown', '/auth/login');
    res.status(429).json({
      error: 'Too many login attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Kitchen API rate limiter (less strict for staff)
export const kitchenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per 15 minutes
  message: {
    error: 'Too many kitchen requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logRateLimitExceeded(req.ip || 'unknown', '/kitchen');
    res.status(429).json({
      error: 'Too many kitchen requests, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Slow down middleware for API endpoints
export const apiSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: (used: number, req: any) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500;
  },
  maxDelayMs: 20000, // maximum delay of 20 seconds
});

// Slow down middleware for order endpoints
export const orderSlowDown = slowDown({
  windowMs: 5 * 60 * 1000, // 5 minutes
  delayAfter: 5, // allow 5 requests per 5 minutes, then...
  delayMs: (used: number, req: any) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 1000;
  },
  maxDelayMs: 10000, // maximum delay of 10 seconds
});

// Dynamic rate limiter based on user role
export const dynamicRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user?.role === 'super_admin') {
    // Super admins get higher limits
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      message: { error: 'Rate limit exceeded for super admin' }
    })(req, res, next);
  } else if (user?.role === 'staff') {
    // Staff get moderate limits
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      message: { error: 'Rate limit exceeded for staff' }
    })(req, res, next);
  } else {
    // Regular users get standard limits
    return apiRateLimiter(req, res, next);
  }
};

// IP-based blocking for suspicious activity
const suspiciousIPs = new Map<string, { count: number; blockedUntil: Date }>();

export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || 'unknown';
  const now = new Date();
  
  // Check if IP is currently blocked
  const blocked = suspiciousIPs.get(ip);
  if (blocked && blocked.blockedUntil > now) {
    logSecurityEvent('Blocked IP access attempt', { ip, path: req.path });
    res.status(403).json({
      error: 'Access temporarily blocked due to suspicious activity',
      retryAfter: blocked.blockedUntil.toISOString()
    });
    return;
  }
  
  // Clean up expired blocks
  if (blocked && blocked.blockedUntil <= now) {
    suspiciousIPs.delete(ip);
  }
  
  next();
};

// Track suspicious activity
export const trackSuspiciousActivity = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || 'unknown';
  
  // Track failed authentication attempts
  if (req.path.includes('/auth') && res.statusCode === 401) {
    const current = suspiciousIPs.get(ip) || { count: 0, blockedUntil: new Date() };
    current.count += 1;
    
    // Block IP after 5 failed attempts for 1 hour
    if (current.count >= 5) {
      current.blockedUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      logSecurityEvent('IP blocked due to suspicious activity', { ip, count: current.count });
    }
    
    suspiciousIPs.set(ip, current);
  }
  
  next();
};

// Export all rate limiters
export default {
  apiRateLimiter,
  orderRateLimiter,
  customerRateLimiter,
  authRateLimiter,
  kitchenRateLimiter,
  apiSlowDown,
  orderSlowDown,
  dynamicRateLimiter,
  suspiciousActivityDetector,
  trackSuspiciousActivity
}; 