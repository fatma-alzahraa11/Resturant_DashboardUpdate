import { Request, Response, NextFunction } from 'express';

const notFound = (req: any, res: any, next: any): void => {
  res.status(404).json({ error: 'Route not found' });
};

export default notFound; 