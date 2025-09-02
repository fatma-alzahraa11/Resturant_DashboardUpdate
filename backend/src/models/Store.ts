import mongoose, { Document, Schema } from 'mongoose';

export interface IStoreAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IStoreContact {
  phone: string;
  email: string;
}

export interface IOpeningHours {
  [day: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export interface IStoreSettings {
  tableCount: number;
  deliveryRadius: number;
  deliveryFee: number;
  minimumOrder: number;
  openingHours: IOpeningHours;
  paymentMethods: string[];
  onlinePaymentEnabled: boolean;
  autoAcceptOrders: boolean;
  preparationTime: number; // in minutes
  maxConcurrentOrders: number;
}

export interface IQRCode {
  tableId: string;
  qrCode: string;
  tableNumber?: string;
  isActive: boolean;
  scanCount: number;
  lastScanned?: Date;
  createdAt: Date;
}

export interface IStore extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  address: IStoreAddress;
  contact: IStoreContact;
  settings: IStoreSettings;
  qrCodes: IQRCode[];
  managerId?: mongoose.Types.ObjectId;
  isActive: boolean;
  isOpen: boolean;
  currentOrders: number;
  totalOrders: number;
  monthlyRevenue: number;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const storeAddressSchema = new Schema<IStoreAddress>({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true
  },
  coordinates: {
    type: [Number],
    required: [true, 'Coordinates are required'],
    validate: {
      validator: function(v: number[]) {
        return v.length === 2 && 
               v[0] >= -180 && v[0] <= 180 && 
               v[1] >= -90 && v[1] <= 90;
      },
      message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.'
    }
  }
});

const storeContactSchema = new Schema<IStoreContact>({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  }
});

const openingHoursSchema = new Schema<IOpeningHours>({
  monday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' },
    isOpen: { type: Boolean, default: true }
  },
  tuesday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' },
    isOpen: { type: Boolean, default: true }
  },
  wednesday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' },
    isOpen: { type: Boolean, default: true }
  },
  thursday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '22:00' },
    isOpen: { type: Boolean, default: true }
  },
  friday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '23:00' },
    isOpen: { type: Boolean, default: true }
  },
  saturday: {
    open: { type: String, default: '10:00' },
    close: { type: String, default: '23:00' },
    isOpen: { type: Boolean, default: true }
  },
  sunday: {
    open: { type: String, default: '10:00' },
    close: { type: String, default: '22:00' },
    isOpen: { type: Boolean, default: true }
  }
});

const storeSettingsSchema = new Schema<IStoreSettings>({
  tableCount: {
    type: Number,
    default: 20,
    min: [0, 'Table count cannot be negative']
  },
  deliveryRadius: {
    type: Number,
    default: 5, // in kilometers
    min: [0, 'Delivery radius cannot be negative'],
    max: [50, 'Delivery radius cannot exceed 50km']
  },
  deliveryFee: {
    type: Number,
    default: 2.99,
    min: [0, 'Delivery fee cannot be negative']
  },
  minimumOrder: {
    type: Number,
    default: 10.00,
    min: [0, 'Minimum order cannot be negative']
  },
  openingHours: {
    type: openingHoursSchema,
    default: () => ({})
  },
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'online', 'mobile_payment'],
    default: ['cash', 'card']
  }],
  onlinePaymentEnabled: {
    type: Boolean,
    default: true
  },
  autoAcceptOrders: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    default: 20, // in minutes
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [120, 'Preparation time cannot exceed 2 hours']
  },
  maxConcurrentOrders: {
    type: Number,
    default: 50,
    min: [1, 'Max concurrent orders must be at least 1']
  }
});

const qrCodeSchema = new Schema<IQRCode>({
  tableId: {
    type: String,
    required: true,
    unique: true
  },
  qrCode: {
    type: String,
    required: true
  },
  tableNumber: {
    type: String,
    trim: true
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
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const storeSchema = new Schema<IStore>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  address: {
    type: storeAddressSchema,
    required: true
  },
  contact: {
    type: storeContactSchema,
    required: true
  },
  settings: {
    type: storeSettingsSchema,
    default: () => ({})
  },
  qrCodes: [{
    type: qrCodeSchema,
    default: []
  }],
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  currentOrders: {
    type: Number,
    default: 0,
    min: [0, 'Current orders cannot be negative']
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Total orders cannot be negative']
  },
  monthlyRevenue: {
    type: Number,
    default: 0,
    min: [0, 'Monthly revenue cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: [0, 'Total reviews cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
storeSchema.virtual('averageRating').get(function() {
  return this.totalReviews > 0 ? (this.rating / this.totalReviews).toFixed(1) : 0;
});

// Virtual for store status
storeSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (!this.isOpen) return 'closed';
  return 'open';
});

// Virtual for active QR codes count
storeSchema.virtual('activeQRCodes').get(function() {
  return this.qrCodes.filter(qr => qr.isActive).length;
});

// Indexes
storeSchema.index({ 'address.coordinates': '2dsphere' });
storeSchema.index({ restaurantId: 1 });
storeSchema.index({ managerId: 1 });
storeSchema.index({ isActive: 1 });
storeSchema.index({ isOpen: 1 });
storeSchema.index({ 'address.city': 1 });

// Pre-save middleware to generate QR codes if not exists
storeSchema.pre('save', function(next) {
  if (this.isNew && this.qrCodes.length === 0) {
    // Generate QR codes for tables
    for (let i = 1; i <= this.settings.tableCount; i++) {
      const tableId = `${this._id}_table_${i}`;
      const qrCode = `https://menu.example.com/store/${this._id}/table/${i}`;
      
      this.qrCodes.push({
        tableId,
        qrCode,
        tableNumber: i.toString(),
        isActive: true,
        scanCount: 0,
        createdAt: new Date()
      });
    }
  }
  next();
});

// Instance method to check if store is currently open
storeSchema.methods.isCurrentlyOpen = function(): boolean {
  if (!this.isActive || !this.isOpen) return false;
  
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); 
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.settings.openingHours[dayOfWeek];
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Instance method to increment scan count for QR code
storeSchema.methods.incrementQRScan = function(tableId: string): boolean {
  const foundQRCode = this.qrCodes.find((qr: IQRCode) => qr.tableId === tableId);
  if (foundQRCode && foundQRCode.isActive) {
    foundQRCode.scanCount += 1;
    foundQRCode.lastScanned = new Date();
    return true;
  }
  return false;
};

// Instance method to add new QR code
storeSchema.methods.addQRCode = function(tableNumber: string): IQRCode {
  const tableId = `${this._id}_table_${tableNumber}`;
  const qrCode = `https://menu.example.com/store/${this._id}/table/${tableNumber}`;
  
  const newQRCode: IQRCode = {
    tableId,
    qrCode,
    tableNumber,
    isActive: true,
    scanCount: 0,
    createdAt: new Date()
  };
  
  this.qrCodes.push(newQRCode);
  return newQRCode;
};

// Static method to find stores by location
storeSchema.statics.findNearby = function(longitude: number, latitude: number, maxDistance: number = 10) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    isActive: true,
    isOpen: true
  });
};

// Static method to find open stores
storeSchema.statics.findOpen = function() {
  return this.find({ 
    isActive: true, 
    isOpen: true 
  });
};

// Static method to find stores by restaurant
storeSchema.statics.findByRestaurant = function(restaurantId: string) {
  return this.find({ 
    restaurantId,
    isActive: true 
  }).sort({ name: 1 });
};

export default mongoose.model<IStore>('Store', storeSchema);
