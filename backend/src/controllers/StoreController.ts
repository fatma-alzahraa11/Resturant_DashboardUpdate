import Store from '../models/Store';

export default {
  create: async (req: any, res: any) => {
    try {
      const store = new Store(req.body);
      await store.save();
      res.status(201).json(store);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  list: async (req: any, res: any) => {
    try {
      const stores = await Store.find();
      res.json(stores);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  get: async (req: any, res: any) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) return res.status(404).json({ error: 'Store not found' });
      res.json(store);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  update: async (req: any, res: any) => {
    try {
      const store = await Store.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!store) return res.status(404).json({ error: 'Store not found' });
      res.json(store);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  remove: async (req: any, res: any) => {
    try {
      const store = await Store.findByIdAndDelete(req.params.id);
      if (!store) return res.status(404).json({ error: 'Store not found' });
      res.json({ message: 'Store deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  analytics: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },

  createQRCode: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  }
}; 