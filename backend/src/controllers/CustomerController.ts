import Customer from '../models/Customer';

export default {
  create: async (req: any, res: any) => {
    try {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json(customer);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  list: async (req: any, res: any) => {
    try {
      const customers = await Customer.find();
      res.json(customers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  get: async (req: any, res: any) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.json(customer);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  update: async (req: any, res: any) => {
    try {
      const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.json(customer);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  remove: async (req: any, res: any) => {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.json({ message: 'Customer deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  getOrders: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },

  getFeedback: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },

  export: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  }
}; 