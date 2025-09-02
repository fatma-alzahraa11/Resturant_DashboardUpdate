import { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/Restaurant';

const ownershipCheck = (req: any, res: any, next: any): void => {
  const user = req.user;
  
  // Super admins can access everything
  if (user.role === 'super_admin') {
    return next();
  }

  // For restaurant owners, check if they own the restaurant
  if (user.role === 'restaurant_owner') {
    const restaurantId = req.params.restaurantId || req.params.id || req.body.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    // Check if the user owns this restaurant
    if (user.restaurantId && user.restaurantId.toString() === restaurantId.toString()) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied. You can only access your own restaurant.' });
  }

  // For other roles, check if they belong to the restaurant
  if (user.restaurantId) {
    const restaurantId = req.params.restaurantId || req.params.id || req.body.restaurantId;
    
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    if (user.restaurantId.toString() === restaurantId.toString()) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied. You can only access your assigned restaurant.' });
  }

  res.status(403).json({ error: 'Access denied' });
};

export default ownershipCheck; 