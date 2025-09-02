import Feedback from '../models/Feedback';

export default {
  create: async (req: any, res: any) => {
    try {
      const feedback = new Feedback(req.body);
      await feedback.save();
      res.status(201).json(feedback);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  list: async (req: any, res: any) => {
    try {
      const feedbacks = await Feedback.find();
      res.json(feedbacks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  get: async (req: any, res: any) => {
    try {
      const feedback = await Feedback.findById(req.params.id);
      if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
      res.json(feedback);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  update: async (req: any, res: any) => {
    try {
      const feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
      res.json(feedback);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  remove: async (req: any, res: any) => {
    try {
      const feedback = await Feedback.findByIdAndDelete(req.params.id);
      if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
      res.json({ message: 'Feedback deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  respond: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  },

  export: async (req: any, res: any) => {
    res.status(501).json({ message: 'Not implemented' });
  }
}; 