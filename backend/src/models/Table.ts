import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITableStatus {
  isAvailable: boolean;
  isOccupied: boolean;
  currentOrderId?: mongoose.Types.ObjectId;
  occupiedAt?: Date;
  lastCleaned?: Date;
  notes?: string;
}

export interface ITableQR {
  qrCode: string;
  isActive: boolean;
  scanCount: number;
  lastScanned?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

// Instance methods interface
export interface ITableMethods {
  occupy(orderId: string): boolean;
  free(): boolean;
  incrementQRScan(): void;
  regenerateQR(): Promise<void>;
}

// Static methods interface
export interface ITableModel extends Model<ITable, {}, ITableMethods> {
  findAvailable(storeId: string): Promise<ITable[]>;
  findOccupied(storeId: string): Promise<ITable[]>;
  findByQRCode(qrCode: string): Promise<ITable | null>;
  getStatistics(storeId: string): Promise<any[]>;
}

export interface ITable extends Document, ITableMethods {
  tableNumber: string;
  storeId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  status: ITableStatus;
  qr: ITableQR;
  capacity: number;
  location: string; // e.g., "indoor", "outdoor", "bar", "window"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  availabilityStatus: string;
  qrExpired: boolean;
}

const tableStatusSchema = new Schema<ITableStatus>({
  isAvailable: {
    type: Boolean,
    default: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  currentOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  occupiedAt: {
    type: Date
  },
  lastCleaned: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Table notes cannot exceed 200 characters']
  }
});

const tableQRSchema = new Schema<ITableQR>({
  qrCode: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  scanCount: {
    type: Number,
    default: 0,
    min: [0, 'Scan count cannot be negative']
  },
  lastScanned: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
});

const tableSchema = new Schema<ITable>({
  tableNumber: {
    type: String,
    required: [true, 'Table number is required'],
    trim: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  status: {
    type: tableStatusSchema,
    default: () => ({})
  },
  qr: {
    type: tableQRSchema,
    required: true
  },
  capacity: {
    type: Number,
    default: 4,
    min: [1, 'Table capacity must be at least 1'],
    max: [20, 'Table capacity cannot exceed 20']
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'bar', 'window', 'private', 'patio'],
    default: 'indoor'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for table availability status
tableSchema.virtual('availabilityStatus').get(function() {
  if (!this.isActive) return 'inactive';
  if (!this.status.isAvailable) return 'unavailable';
  if (this.status.isOccupied) return 'occupied';
  return 'available';
});

// Virtual for QR code expiration status
tableSchema.virtual('qrExpired').get(function() {
  if (!this.qr.expiresAt) return false;
  return new Date() > this.qr.expiresAt;
});

// Indexes
tableSchema.index({ storeId: 1, tableNumber: 1 }, { unique: true });
tableSchema.index({ restaurantId: 1 });
tableSchema.index({ 'status.isAvailable': 1 });
tableSchema.index({ 'status.isOccupied': 1 });
tableSchema.index({ 'qr.isActive': 1 });
tableSchema.index({ isActive: 1 });

// Pre-save middleware to generate QR code if not exists
tableSchema.pre('save', async function(next) {
  if (this.isNew && !this.qr.qrCode) {
    const qrService = require('../services/qrService').default;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    try {
      this.qr.qrCode = await qrService.generateTableQR(
        this.tableNumber,
        this.storeId.toString(),
        this.restaurantId.toString(),
        baseUrl
      );
    } catch (error) {
      console.error('Failed to generate QR code for table:', error);
    }
  }
  next();
});

// Instance method to occupy table
tableSchema.methods.occupy = function(orderId: string): boolean {
  if (!this.status.isAvailable || this.status.isOccupied) {
    return false;
  }
  
  this.status.isOccupied = true;
  this.status.currentOrderId = orderId;
  this.status.occupiedAt = new Date();
  return true;
};

// Instance method to free table
tableSchema.methods.free = function(): boolean {
  if (!this.status.isOccupied) {
    return false;
  }
  
  this.status.isOccupied = false;
  this.status.currentOrderId = undefined;
  this.status.occupiedAt = undefined;
  this.status.lastCleaned = new Date();
  return true;
};

// Instance method to increment QR scan count
tableSchema.methods.incrementQRScan = function(): void {
  this.qr.scanCount += 1;
  this.qr.lastScanned = new Date();
};

// Instance method to regenerate QR code
tableSchema.methods.regenerateQR = async function(): Promise<void> {
  const qrService = require('../services/qrService').default;
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  this.qr.qrCode = await qrService.generateTableQR(
    this.tableNumber,
    this.storeId.toString(),
    this.restaurantId.toString(),
    baseUrl
  );
  this.qr.scanCount = 0;
  this.qr.lastScanned = undefined;
  this.qr.createdAt = new Date();
};

// Static method to find available tables
tableSchema.statics.findAvailable = function(storeId: string) {
  return this.find({
    storeId,
    isActive: true,
    'status.isAvailable': true,
    'status.isOccupied': false
  }).sort({ tableNumber: 1 });
};

// Static method to find occupied tables
tableSchema.statics.findOccupied = function(storeId: string) {
  return this.find({
    storeId,
    isActive: true,
    'status.isOccupied': true
  }).populate('status.currentOrderId', 'orderNumber customerInfo status createdAt');
};

// Static method to find table by QR code
tableSchema.statics.findByQRCode = function(qrCode: string) {
  return this.findOne({
    'qr.qrCode': qrCode,
    'qr.isActive': true,
    isActive: true
  });
};

// Static method to get table statistics
tableSchema.statics.getStatistics = function(storeId: string) {
  return this.aggregate([
    { $match: { storeId: new mongoose.Types.ObjectId(storeId), isActive: true } },
    {
      $group: {
        _id: null,
        totalTables: { $sum: 1 },
        availableTables: {
          $sum: {
            $cond: [
              { $and: ['$status.isAvailable', { $not: '$status.isOccupied' }] },
              1,
              0
            ]
          }
        },
        occupiedTables: {
          $sum: { $cond: ['$status.isOccupied', 1, 0] }
        },
        totalScans: { $sum: '$qr.scanCount' }
      }
    }
  ]);
};

export default mongoose.model<ITable, ITableModel>('Table', tableSchema); 