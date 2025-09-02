import { Request, Response, NextFunction } from 'express';

const logger = (req: any, res: any, next: any): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

export default logger; 