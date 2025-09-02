import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomerAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: [number, number]; // [longitude, latitude]
  isDefault: boolean;
  label?: string; // Home, Work, etc.
}

export interface ICustomerPreferences {
  dietaryRestrictions: string[];
  favoriteItems: mongoose.Types.ObjectId[];
  language: string;
  currency: string;
  timezone: string;
  marketingEmails: boolean;
  marketingSMS: boolean;
  pushNotifications: boolean;
  preferredPaymentMethod: string;
  preferredDeliveryTime?: string;
}

export interface ILoyalty {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  joinDate: Date;
  lastActivity: Date;
  pointsEarned: number;
  pointsRedeemed: number;
  tierUpgradeDate?: Date;
  tierDowngradeDate?: Date;
}

export interface ICustomer extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  addresses: ICustomerAddress[];
  preferences: ICustomerPreferences;
  loyalty: ILoyalty;
  orderHistory: mongoose.Types.ObjectId[];
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const customerAddressSchema = new Schema<ICustomerAddress>({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: [Number],
    validate: {
      validator: function(v: number[]) {
        return !v || (v.length === 2 && 
               v[0] >= -180 && v[0] <= 180 && 
               v[1] >= -90 && v[1] <= 90);
      },
      message: 'Invalid coordinates'
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    trim: true,
    maxlength: [20, 'Address label cannot exceed 20 characters']
  }
});

const customerPreferencesSchema = new Schema<ICustomerPreferences>({
  dietaryRestrictions: [{
    type: String,
    enum: [
      'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free',
      'halal', 'kosher', 'low_sodium', 'low_sugar', 'keto', 'paleo'
    ]
  }],
  favoriteItems: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  language: {
    type: String,
    enum: ['en', 'ar', 'de', 'fr', 'es'],
    default: 'en'
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'QAR', 'KWD'],
    default: 'USD'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  marketingEmails: {
    type: Boolean,
    default: true
  },
  marketingSMS: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  preferredPaymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'mobile_payment'],
    default: 'card'
  },
  preferredDeliveryTime: {
    type: String,
    enum: ['asap', 'scheduled'],
    default: 'asap'
  }
});

const loyaltySchema = new Schema<ILoyalty>({
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: [0, 'Total spent cannot be negative']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Points earned cannot be negative']
  },
  pointsRedeemed: {
    type: Number,
    default: 0,
    min: [0, 'Points redeemed cannot be negative']
  },
  tierUpgradeDate: {
    type: Date
  },
  tierDowngradeDate: {
    type: Date
  }
});

const customerSchema = new Schema<ICustomer>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  addresses: [{
    type: customerAddressSchema,
    default: []
  }],
  preferences: {
    type: customerPreferencesSchema,
    default: () => ({})
  },
  loyalty: {
    type: loyaltySchema,
    default: () => ({})
  },
  orderHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }],
  totalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Total orders cannot be negative']
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: [0, 'Total spent cannot be negative']
  },
  averageOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Average order value cannot be negative']
  },
  lastOrderDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for default address
customerSchema.virtual('defaultAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

// Virtual for loyalty tier benefits
customerSchema.virtual('tierBenefits').get(function() {
  const benefits = {
    bronze: { discount: 0, pointsMultiplier: 1, freeDelivery: false },
    silver: { discount: 5, pointsMultiplier: 1.2, freeDelivery: false },
    gold: { discount: 10, pointsMultiplier: 1.5, freeDelivery: true },
    platinum: { discount: 15, pointsMultiplier: 2, freeDelivery: true }
  };
  return benefits[this.loyalty.tier];
});

// Virtual for next tier requirements
customerSchema.virtual('nextTierRequirements').get(function() {
  const requirements = {
    bronze: { minSpent: 0, minOrders: 0 },
    silver: { minSpent: 100, minOrders: 5 },
    gold: { minSpent: 500, minOrders: 20 },
    platinum: { minSpent: 1000, minOrders: 50 }
  };
  
  const currentTier = this.loyalty.tier;
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex < tiers.length - 1) {
    const nextTier = tiers[currentIndex + 1];
    return {
      tier: nextTier,
      ...(requirements as any)[nextTier],
      progress: {
        spent: Math.min((this.loyalty.totalSpent / (requirements as any)[nextTier].minSpent) * 100, 100),
        orders: Math.min((this.totalOrders / (requirements as any)[nextTier].minOrders) * 100, 100)
      }
    };
  }
  
  return null;
});

// Indexes
customerSchema.index({ restaurantId: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ restaurantId: 1, email: 1 });
customerSchema.index({ restaurantId: 1, phone: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ 'loyalty.tier': 1 });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ totalOrders: -1 });
customerSchema.index({ lastOrderDate: -1 });

// Pre-save middleware to ensure only one default address
customerSchema.pre('save', function(next) {
  if (this.isModified('addresses')) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first default address
      let foundDefault = false;
      this.addresses.forEach(addr => {
        if (addr.isDefault && !foundDefault) {
          foundDefault = true;
        } else if (addr.isDefault) {
          addr.isDefault = false;
        }
      });
    }
  }
  next();
});

// Pre-save middleware to update loyalty tier
customerSchema.pre('save', function(next) {
  if (this.isModified('loyalty.totalSpent') || this.isModified('totalOrders')) {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const requirements = {
      bronze: { minSpent: 0, minOrders: 0 },
      silver: { minSpent: 100, minOrders: 5 },
      gold: { minSpent: 500, minOrders: 20 },
      platinum: { minSpent: 1000, minOrders: 50 }
    };
    
    let newTier = 'bronze' ;
    for (const tier of tiers) {
      if (this.loyalty.totalSpent >= (requirements as any)[tier].minSpent && 
          this.totalOrders >= (requirements as any)[tier].minOrders) {
        newTier = tier;
      }
    }
    
    if (newTier !== this.loyalty.tier) {
      const oldTier = this.loyalty.tier;
      this.loyalty.tier = newTier as 'bronze' | 'silver' | 'gold' | 'platinum';
      
      if (tiers.indexOf(newTier) > tiers.indexOf(oldTier)) {
        this.loyalty.tierUpgradeDate = new Date();
      } else {
        this.loyalty.tierDowngradeDate = new Date();
      }
    }
  }
  next();
});

// Instance method to add address
customerSchema.methods.addAddress = function(addressData: Omit<ICustomerAddress, 'isDefault'>): ICustomerAddress {
  const newAddress: ICustomerAddress = {
    ...addressData,
    isDefault: this.addresses.length === 0 // First address becomes default
  };
  
  if (newAddress.isDefault) {
    // Remove default from other addresses
    this.addresses.forEach((addr: ICustomerAddress) => addr.isDefault = false);
  }
  
  this.addresses.push(newAddress);
  return newAddress;
};

// Instance method to set default address
customerSchema.methods.setDefaultAddress = function(addressIndex: number): boolean {
  if (addressIndex >= 0 && addressIndex < this.addresses.length) {
    this.addresses.forEach((addr: ICustomerAddress, index: number) => {
      addr.isDefault = index === addressIndex;
    });
    return true;
  }
  return false;
};

// Instance method to remove address
customerSchema.methods.removeAddress = function(addressIndex: number): boolean {
  if (addressIndex >= 0 && addressIndex < this.addresses.length) {
    const removedAddress = this.addresses.splice(addressIndex, 1)[0];
    
    // If we removed the default address and there are other addresses, set the first one as default
    if (removedAddress.isDefault && this.addresses.length > 0) {
      this.addresses[0].isDefault = true;
    }
    
    return true;
  }
  return false;
};

// Instance method to add points
customerSchema.methods.addPoints = async function(points: number, reason: string): Promise<void> {
  this.loyalty.points += points;
  this.loyalty.pointsEarned += points;
  this.loyalty.lastActivity = new Date();
  await this.save();
};

// Instance method to redeem points
customerSchema.methods.redeemPoints = async function(points: number): Promise<boolean> {
  if (this.loyalty.points >= points) {
    this.loyalty.points -= points;
    this.loyalty.pointsRedeemed += points;
    this.loyalty.lastActivity = new Date();
    await this.save();
    return true;
  }
  return false;
};

// Instance method to add order
customerSchema.methods.addOrder = async function(orderId: string, orderTotal: number): Promise<void> {
  this.orderHistory.push(orderId);
  this.totalOrders += 1;
  this.totalSpent += orderTotal;
  this.averageOrderValue = this.totalSpent / this.totalOrders;
  this.lastOrderDate = new Date();
  this.loyalty.lastActivity = new Date();
  
  // Add loyalty points (1 point per dollar spent)
  const pointsEarned = Math.floor(orderTotal);
  this.loyalty.points += pointsEarned;
  this.loyalty.pointsEarned += pointsEarned;
  
  await this.save();
};

// Instance method to update preferences
customerSchema.methods.updatePreferences = function(preferences: Partial<ICustomerPreferences>): void {
  this.preferences = { ...this.preferences, ...preferences };
};

// Static method to find customers by restaurant
customerSchema.statics.findByRestaurant = function(restaurantId: string, options: {
  activeOnly?: boolean;
  tier?: string;
  searchTerm?: string;
  limit?: number;
  skip?: number;
} = {}) {
  let query: any = { restaurantId };
  
  if (options.activeOnly) {
    query.isActive = true;
  }
  
  if (options.tier) {
    query['loyalty.tier'] = options.tier;
  }
  
  if (options.searchTerm) {
    query.$or = [
      { name: { $regex: options.searchTerm, $options: 'i' } },
      { email: { $regex: options.searchTerm, $options: 'i' } },
      { phone: { $regex: options.searchTerm, $options: 'i' } }
    ];
  }
  
  let result = this.find(query).sort({ createdAt: -1 });
  
  if (options.limit) {
    result = result.limit(options.limit);
  }
  
  if (options.skip) {
    result = result.skip(options.skip);
  }
  
  return result;
};

// Static method to find top customers
customerSchema.statics.findTopCustomers = function(restaurantId: string, limit: number = 10) {
  return this.find({ restaurantId, isActive: true })
    .sort({ totalSpent: -1, totalOrders: -1 })
    .limit(limit);
};

// Static method to find customers by tier
customerSchema.statics.findByTier = function(restaurantId: string, tier: string) {
  return this.find({ 
    restaurantId, 
    'loyalty.tier': tier,
    isActive: true 
  }).sort({ 'loyalty.totalSpent': -1 });
};

// Static method to find inactive customers
customerSchema.statics.findInactive = function(restaurantId: string, days: number = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return this.find({
    restaurantId,
    isActive: true,
    $or: [
      { lastOrderDate: { $lt: date } },
      { lastOrderDate: { $exists: false } }
    ]
  });
};

// Static method to get customer statistics
customerSchema.statics.getStatistics = function(restaurantId: string) {
  return this.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        activeCustomers: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedCustomers: { $sum: { $cond: ['$isVerified', 1, 0] } },
        averageSpent: { $avg: '$totalSpent' },
        totalRevenue: { $sum: '$totalSpent' },
        averageOrders: { $avg: '$totalOrders' }
      }
    }
  ]);
};

export default mongoose.model<ICustomer>('Customer', customerSchema);
