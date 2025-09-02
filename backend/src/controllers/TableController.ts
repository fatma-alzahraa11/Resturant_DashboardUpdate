import Table from '../models/Table';
import Store from '../models/Store';
import Order from '../models/Order';

export default {
  // Create new table
  create: async (req: any, res: any) => {
    try {
      const { storeId, tableNumber, capacity, location } = req.body;
      const user = req.user;

      // Validate store ownership
      if (user.role !== 'super_admin' && user.storeId?.toString() !== storeId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if table number already exists
      const existingTable = await Table.findOne({ storeId, tableNumber });
      if (existingTable) {
        return res.status(400).json({ error: 'Table number already exists' });
      }

      const table = new Table({
        storeId,
        tableNumber,
        capacity: capacity || 4,
        location: location || 'indoor'
      });

      await table.save();

      res.status(201).json(table);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Get all tables for a store
  list: async (req: any, res: any) => {
    try {
      const { storeId } = req.params;
      const { status, location } = req.query;
      const user = req.user;

      // Validate access
      if (user.role !== 'super_admin' && user.storeId?.toString() !== storeId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      let query: any = { storeId };

      if (status) {
        switch (status) {
          case 'available':
            query['status.isAvailable'] = true;
            query['status.isOccupied'] = false;
            break;
          case 'occupied':
            query['status.isOccupied'] = true;
            break;
          case 'unavailable':
            query['status.isAvailable'] = false;
            break;
        }
      }

      if (location) {
        query.location = location;
      }

      const tables = await Table.find(query)
        .populate('status.currentOrderId', 'orderNumber customerInfo status createdAt')
        .sort({ tableNumber: 1 });

      res.json(tables);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get single table
  get: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const table = await Table.findById(id)
        .populate('status.currentOrderId', 'orderNumber customerInfo status createdAt items');

      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      // Validate access
      if (user.role !== 'super_admin' && user.storeId?.toString() !== table.storeId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(table);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Update table
  update: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { capacity, location, isActive, status } = req.body;
      const user = req.user;

      const table = await Table.findById(id);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      // Validate access
      if (user.role !== 'super_admin' && user.storeId?.toString() !== table.storeId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update fields
      if (capacity !== undefined) table.capacity = capacity;
      if (location !== undefined) table.location = location;
      if (isActive !== undefined) table.isActive = isActive;
      if (status) {
        if (status.isAvailable !== undefined) table.status.isAvailable = status.isAvailable;
        if (status.notes !== undefined) table.status.notes = status.notes;
      }

      await table.save();
      res.json(table);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Delete table
  remove: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const table = await Table.findById(id);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      // Validate access
      if (user.role !== 'super_admin' && user.storeId?.toString() !== table.storeId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if table is occupied
      if (table.status.isOccupied) {
        return res.status(400).json({ error: 'Cannot delete occupied table' });
      }

      await Table.findByIdAndDelete(id);
      res.json({ message: 'Table deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Free table (mark as available)
  freeTable: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const table = await Table.findById(id);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      // Validate access
      if (user.role !== 'super_admin' && user.storeId?.toString() !== table.storeId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!table.status.isOccupied) {
        return res.status(400).json({ error: 'Table is not occupied' });
      }

      table.free();
      await table.save();

      res.json({ 
        message: 'Table freed successfully',
        table 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Occupy table
  occupyTable: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { orderId } = req.body;
      const user = req.user;

      const table = await Table.findById(id);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      // Validate access
      if (user.role !== 'super_admin' && user.storeId?.toString() !== table.storeId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!table.status.isAvailable || table.status.isOccupied) {
        return res.status(400).json({ error: 'Table is not available' });
      }

      // Validate order if provided
      if (orderId) {
        const order = await Order.findById(orderId);
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
      }

      table.occupy(orderId);
      await table.save();

      res.json({ 
        message: 'Table occupied successfully',
        table 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Regenerate QR code
  regenerateQR: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const table = await Table.findById(id);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }

      // Validate access
      if (user.role !== 'super_admin' && user.storeId?.toString() !== table.storeId?.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await table.regenerateQR();
      await table.save();

      res.json({ 
        message: 'QR code regenerated successfully',
        table 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get table statistics
  getStatistics: async (req: any, res: any) => {
    try {
      const { storeId } = req.params;
      const user = req.user;

      // Validate access
      if (user.role !== 'super_admin' && user.storeId?.toString() !== storeId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const stats = await Table.getStatistics(storeId);
      const availableTables = await Table.findAvailable(storeId);
      const occupiedTables = await Table.findOccupied(storeId);

      res.json({
        statistics: stats[0] || {
          totalTables: 0,
          availableTables: 0,
          occupiedTables: 0,
          totalScans: 0
        },
        availableTables: availableTables.length,
        occupiedTables: occupiedTables.length
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // Bulk create tables
  bulkCreate: async (req: any, res: any) => {
    try {
      const { storeId, tables } = req.body;
      const user = req.user;

      // Validate access
      if (user.role !== 'super_admin' && user.storeId?.toString() !== storeId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Validate store exists
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      const createdTables = [];
      const errors = [];

      for (const tableData of tables) {
        try {
          // Check if table number already exists
          const existingTable = await Table.findOne({ 
            storeId, 
            tableNumber: tableData.tableNumber 
          });

          if (existingTable) {
            errors.push(`Table ${tableData.tableNumber} already exists`);
            continue;
          }

          const table = new Table({
            storeId,
            tableNumber: tableData.tableNumber,
            capacity: tableData.capacity || 4,
            location: tableData.location || 'indoor'
          });

          await table.save();
          createdTables.push(table);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to create table ${tableData.tableNumber}: ${errorMessage}`);
        }
      }

      res.status(201).json({
        created: createdTables.length,
        tables: createdTables,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}; 