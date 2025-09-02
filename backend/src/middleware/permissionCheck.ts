import { Request, Response, NextFunction } from 'express';

const permissionCheck = (requiredPermissions: string[]) => (req: any, res: any, next: any): void => {
  const user = req.user;
  
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Super admin has all permissions
  if (user.role === 'super_admin') {
    next();
    return;
  }

  // Check if user has required permissions
  const hasPermission = requiredPermissions.some(permission => 
    user.permissions && user.permissions.includes(permission)
  );

  if (!hasPermission) {
    res.status(403).json({ 
      error: 'Access denied',
      details: `Required permissions: ${requiredPermissions.join(', ')}`
    });
    return;
  }

  next();
};

export default permissionCheck; 