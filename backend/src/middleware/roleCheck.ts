import { Request, Response, NextFunction } from 'express';

const roleCheck = (roles: string[]) => (req: any, res: any, next: any): void => {
  const user = req.user;
  if (!user || !roles.includes(user.role)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  next();
};

export default roleCheck;
