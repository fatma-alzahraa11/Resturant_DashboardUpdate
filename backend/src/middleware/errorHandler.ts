import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: any, res: any, next: any): void => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

export default errorHandler;
