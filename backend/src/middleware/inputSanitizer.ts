import { Request, Response, NextFunction } from 'express';
import * as xss from 'xss';

// XSS sanitization function
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;
  return xss(str, {
    whiteList: {}, // No allowed tags
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
};

// Recursively sanitize objects
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Specific sanitization for order data
export const sanitizeOrderInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Sanitize customer info
    if (req.body.customerInfo) {
      req.body.customerInfo.name = sanitizeString(req.body.customerInfo.name || '');
      req.body.customerInfo.phone = sanitizeString(req.body.customerInfo.phone || '');
      req.body.customerInfo.email = sanitizeString(req.body.customerInfo.email || '');
    }
    
    // Sanitize order notes
    if (req.body.customerNotes) {
      req.body.customerNotes = sanitizeString(req.body.customerNotes);
    }
    
    // Sanitize item notes
    if (req.body.items && Array.isArray(req.body.items)) {
      req.body.items = req.body.items.map((item: any) => ({
        ...item,
        notes: sanitizeString(item.notes || '')
      }));
    }
  }
  
  next();
};

// Specific sanitization for product data
export const sanitizeProductInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Sanitize product names
    if (req.body.name) {
      if (typeof req.body.name === 'object') {
        req.body.name.en = sanitizeString(req.body.name.en || '');
        req.body.name.ar = sanitizeString(req.body.name.ar || '');
        req.body.name.de = sanitizeString(req.body.name.de || '');
      } else {
        req.body.name = sanitizeString(req.body.name);
      }
    }
    
    // Sanitize descriptions
    if (req.body.description) {
      if (typeof req.body.description === 'object') {
        req.body.description.en = sanitizeString(req.body.description.en || '');
        req.body.description.ar = sanitizeString(req.body.description.ar || '');
        req.body.description.de = sanitizeString(req.body.description.de || '');
      } else {
        req.body.description = sanitizeString(req.body.description);
      }
    }
    
    // Sanitize ingredients
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      req.body.ingredients = req.body.ingredients.map(sanitizeString);
    }
    
    // Sanitize tags
    if (req.body.tags && Array.isArray(req.body.tags)) {
      req.body.tags = req.body.tags.map(sanitizeString);
    }
  }
  
  next();
};

// Specific sanitization for restaurant/store data
export const sanitizeRestaurantInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Sanitize restaurant name and description
    if (req.body.name) req.body.name = sanitizeString(req.body.name);
    if (req.body.description) req.body.description = sanitizeString(req.body.description);
    
    // Sanitize address fields
    if (req.body.address) {
      req.body.address.street = sanitizeString(req.body.address.street || '');
      req.body.address.city = sanitizeString(req.body.address.city || '');
      req.body.address.state = sanitizeString(req.body.address.state || '');
      req.body.address.country = sanitizeString(req.body.address.country || '');
      req.body.address.zipCode = sanitizeString(req.body.address.zipCode || '');
    }
    
    // Sanitize contact fields
    if (req.body.contact) {
      req.body.contact.phone = sanitizeString(req.body.contact.phone || '');
      req.body.contact.email = sanitizeString(req.body.contact.email || '');
      if (req.body.contact.website) {
        req.body.contact.website = sanitizeString(req.body.contact.website);
      }
    }
  }
  
  next();
};

// Specific sanitization for user data
export const sanitizeUserInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Sanitize user names
    if (req.body.firstName) req.body.firstName = sanitizeString(req.body.firstName);
    if (req.body.lastName) req.body.lastName = sanitizeString(req.body.lastName);
    if (req.body.email) req.body.email = sanitizeString(req.body.email);
    if (req.body.phone) req.body.phone = sanitizeString(req.body.phone);
  }
  
  next();
};

// Validation for SQL injection prevention
export const validateSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC', 'UNION',
    'OR', 'AND', 'WHERE', 'FROM', 'JOIN', 'HAVING', 'GROUP BY', 'ORDER BY'
  ];
  
  const checkForSQLKeywords = (obj: any): boolean => {
    if (typeof obj === 'string') {
      const upperStr = obj.toUpperCase();
      return sqlKeywords.some(keyword => upperStr.includes(keyword));
    }
    
    if (Array.isArray(obj)) {
      return obj.some(checkForSQLKeywords);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForSQLKeywords);
    }
    
    return false;
  };
  
  // Check body, query, and params
  if (checkForSQLKeywords(req.body) || checkForSQLKeywords(req.query) || checkForSQLKeywords(req.params)) {
    return res.status(400).json({ 
      error: 'Invalid input detected',
      message: 'Input contains potentially harmful content'
    });
  }
  
  next();
};

// Content type validation
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  const allowedContentTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data'
  ];
  
  const contentType = req.get('Content-Type');
  
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!contentType || !allowedContentTypes.some(type => contentType.includes(type))) {
      return res.status(400).json({
        error: 'Invalid Content-Type',
        message: 'Only JSON and form data are allowed'
      });
    }
  }
  
  next();
};

// Request size validation
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length']);
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        message: 'Request size exceeds maximum allowed size of 10MB'
      });
    }
  }
  
  next();
};

export default {
  sanitizeInput,
  sanitizeOrderInput,
  sanitizeProductInput,
  sanitizeRestaurantInput,
  sanitizeUserInput,
  validateSQLInjection,
  validateContentType,
  validateRequestSize
}; 