import Payment from '../models/Payment';
import { Request, Response } from 'express';

export default {
  // Create a new payment
  createIntent: async (req: any, res: any) => {
    try {
      const payment = new Payment(req.body);
      await payment.save();
      res.status(201).json(payment);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // List all payments (optionally by restaurantId)
  listByRestaurant: async (req: any, res: any) => {
    try {
      const filter: any = {};
      if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
      const payments = await Payment.find(filter);
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get a single payment by ID
  get: async (req: any, res: any) => {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
      res.json(payment);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Confirm and refund methods can be filled in next
  confirm: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },
  refund: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },
}; 