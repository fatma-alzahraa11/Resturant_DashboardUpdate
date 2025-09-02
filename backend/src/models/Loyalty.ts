import mongoose, { Document, Schema } from 'mongoose';

export interface ILoyaltyTier {
  name: string;
  nameAr: string;
  nameDe: string;
  level: number; // 1 = Bronze, 2 = Silver, 3 = Gold, 4 = Platinum
  pointsRequired: number;
  benefits: {
    pointsMultiplier: number;
    discountPercentage: number;
    freeDelivery: boolean;
    prioritySupport: boolean;
    birthdayReward: boolean;
    exclusiveOffers: boolean;
  };
  color: string;
  icon: string;
}

export interface ILoyaltyReward {
  id: string;
  name: string;
  nameAr: string;
  nameDe: string;
  description: string;
  descriptionAr: string;
  descriptionDe: string;
  type: 'points' | 'discount' | 'free_product' | 'free_delivery' | 'cashback';
  value: number; // Points cost, discount percentage, etc.
  pointsCost?: number;
  productId?: mongoose.Types.ObjectId;
  isActive: boolean;
  isPublic: boolean;
  image?: string;
  expiryDate?: Date;
  usageLimit?: number;
  usageCount: number;
  minimumTier?: number;
}

export interface ILoyaltyTransaction {
  customerId: mongoose.Types.ObjectId;
  type: 'earn' | 'spend' | 'expire' | 'adjust';
  points: number;
  orderId?: mongoose.Types.ObjectId;
  rewardId?: string;
  description: string;
  descriptionAr: string;
  descriptionDe: string;
  createdAt: Date;
}

export interface ILoyaltyProgram extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  nameAr: string;
  nameDe: string;
  description: string;
  descriptionAr: string;
  descriptionDe: string;
  isActive: boolean;
  pointsPerCurrency: number; // Points earned per currency unit spent
  minimumPointsToRedeem: number;
  pointsExpiryMonths: number; // Points expire after X months
  tiers: ILoyaltyTier[];
  rewards: ILoyaltyReward[];
  settings: {
    allowNegativePoints: boolean;
    autoEnrollCustomers: boolean;
    welcomePoints: number;
    birthdayPoints: number;
    referralPoints: number;
    socialMediaPoints: number;
    reviewPoints: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerLoyalty extends Document {
  customerId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  programId: mongoose.Types.ObjectId;
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  currentTier: number;
  joinDate: Date;
  lastActivityDate: Date;
  transactions: ILoyaltyTransaction[];
  rewardsRedeemed: {
    rewardId: string;
    redeemedAt: Date;
    orderId?: mongoose.Types.ObjectId;
  }[];
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const loyaltyTierSchema = new Schema<ILoyaltyTier>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Tier name cannot exceed 50 characters']
  },
  nameAr: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Arabic tier name cannot exceed 50 characters']
  },
  nameDe: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'German tier name cannot exceed 50 characters']
  },
  level: {
    type: Number,
    required: true,
    min: [1, 'Tier level must be at least 1'],
    max: [10, 'Tier level cannot exceed 10']
  },
  pointsRequired: {
    type: Number,
    required: true,
    min: [0, 'Points required cannot be negative']
  },
  benefits: {
    pointsMultiplier: {
      type: Number,
      default: 1,
      min: [0.1, 'Points multiplier must be at least 0.1']
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    freeDelivery: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    birthdayReward: {
      type: Boolean,
      default: false
    },
    exclusiveOffers: {
      type: Boolean,
      default: false
    }
  },
  color: {
    type: String,
    required: true,
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  icon: {
    type: String,
    required: true
  }
});

const loyaltyRewardSchema = new Schema<ILoyaltyReward>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Reward name cannot exceed 100 characters']
  },
  nameAr: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Arabic reward name cannot exceed 100 characters']
  },
  nameDe: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'German reward name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic description cannot exceed 500 characters']
  },
  descriptionDe: {
    type: String,
    trim: true,
    maxlength: [500, 'German description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['points', 'discount', 'free_product', 'free_delivery', 'cashback'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Value must be positive']
  },
  pointsCost: {
    type: Number,
    min: [0, 'Points cost cannot be negative']
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  minimumTier: {
    type: Number,
    min: [1, 'Minimum tier must be at least 1']
  }
});

const loyaltyTransactionSchema = new Schema<ILoyaltyTransaction>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  type: {
    type: String,
    enum: ['earn', 'spend', 'expire', 'adjust'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  rewardId: {
    type: String
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  descriptionAr: {
    type: String,
    required: true,
    trim: true
  },
  descriptionDe: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const loyaltyProgramSchema = new Schema<ILoyaltyProgram>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Program name cannot exceed 100 characters']
  },
  nameAr: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Arabic program name cannot exceed 100 characters']
  },
  nameDe: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'German program name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  descriptionAr: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic description cannot exceed 500 characters']
  },
  descriptionDe: {
    type: String,
    trim: true,
    maxlength: [500, 'German description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pointsPerCurrency: {
    type: Number,
    required: true,
    min: [0.01, 'Points per currency must be at least 0.01']
  },
  minimumPointsToRedeem: {
    type: Number,
    required: true,
    min: [1, 'Minimum points to redeem must be at least 1']
  },
  pointsExpiryMonths: {
    type: Number,
    default: 12,
    min: [1, 'Points expiry months must be at least 1']
  },
  tiers: [loyaltyTierSchema],
  rewards: [loyaltyRewardSchema],
  settings: {
    allowNegativePoints: {
      type: Boolean,
      default: false
    },
    autoEnrollCustomers: {
      type: Boolean,
      default: true
    },
    welcomePoints: {
      type: Number,
      default: 0,
      min: [0, 'Welcome points cannot be negative']
    },
    birthdayPoints: {
      type: Number,
      default: 0,
      min: [0, 'Birthday points cannot be negative']
    },
    referralPoints: {
      type: Number,
      default: 0,
      min: [0, 'Referral points cannot be negative']
    },
    socialMediaPoints: {
      type: Number,
      default: 0,
      min: [0, 'Social media points cannot be negative']
    },
    reviewPoints: {
      type: Number,
      default: 0,
      min: [0, 'Review points cannot be negative']
    }
  }
}, {
  timestamps: true
});

const customerLoyaltySchema = new Schema<ICustomerLoyalty>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  programId: {
    type: Schema.Types.ObjectId,
    ref: 'LoyaltyProgram',
    required: true
  },
  currentPoints: {
    type: Number,
    default: 0,
    min: [0, 'Current points cannot be negative']
  },
  totalPointsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Total points earned cannot be negative']
  },
  totalPointsSpent: {
    type: Number,
    default: 0,
    min: [0, 'Total points spent cannot be negative']
  },
  currentTier: {
    type: Number,
    default: 1,
    min: [1, 'Current tier must be at least 1']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  transactions: [loyaltyTransactionSchema],
  rewardsRedeemed: [{
    rewardId: {
      type: String,
      required: true
    },
    redeemedAt: {
      type: Date,
      default: Date.now
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
loyaltyProgramSchema.index({ restaurantId: 1, isActive: 1 });
customerLoyaltySchema.index({ customerId: 1, restaurantId: 1 });
customerLoyaltySchema.index({ programId: 1 });
customerLoyaltySchema.index({ currentPoints: -1 });

// Pre-save middleware to validate tiers
loyaltyProgramSchema.pre('save', function(next) {
  if (this.tiers && this.tiers.length > 0) {
    // Sort tiers by level
    this.tiers.sort((a, b) => a.level - b.level);
    
    // Validate tier progression
    for (let i = 1; i < this.tiers.length; i++) {
      if (this.tiers[i].pointsRequired <= this.tiers[i-1].pointsRequired) {
        return next(new Error('Tier points must increase with level'));
      }
    }
  }
  next();
});

// Method to calculate points from order amount
loyaltyProgramSchema.methods.calculatePointsFromOrder = function(orderAmount: number): number {
  return Math.floor(orderAmount * this.pointsPerCurrency);
};

// Method to get tier for given points
loyaltyProgramSchema.methods.getTierForPoints = function(points: number): ILoyaltyTier | null {
  if (!this.tiers || this.tiers.length === 0) return null;
  
  let currentTier = this.tiers[0];
  for (const tier of this.tiers) {
    if (points >= tier.pointsRequired) {
      currentTier = tier;
    } else {
      break;
    }
  }
  return currentTier;
};

// Method to add points to customer
customerLoyaltySchema.methods.addPoints = function(points: number, reason: string, orderId?: mongoose.Types.ObjectId): void {
  this.currentPoints += points;
  this.totalPointsEarned += points;
  this.lastActivityDate = new Date();
  
  // Add transaction
  this.transactions.push({
    customerId: this.customerId,
    type: 'earn',
    points,
    orderId,
    description: reason,
    descriptionAr: reason, // In real app, translate this
    descriptionDe: reason, // In real app, translate this
    createdAt: new Date()
  });
};

// Method to spend points
customerLoyaltySchema.methods.spendPoints = function(points: number, reason: string, orderId?: mongoose.Types.ObjectId): boolean {
  if (this.currentPoints < points) return false;
  
  this.currentPoints -= points;
  this.totalPointsSpent += points;
  this.lastActivityDate = new Date();
  
  // Add transaction
  this.transactions.push({
    customerId: this.customerId,
    type: 'spend',
    points: -points,
    orderId,
    description: reason,
    descriptionAr: reason, // In real app, translate this
    descriptionDe: reason, // In real app, translate this
    createdAt: new Date()
  });
  
  return true;
};

// Method to check if customer can redeem reward
customerLoyaltySchema.methods.canRedeemReward = function(reward: ILoyaltyReward): boolean {
  if (!reward.isActive) return false;
  if (reward.expiryDate && new Date() > reward.expiryDate) return false;
  if (reward.usageLimit && reward.usageCount >= reward.usageLimit) return false;
  if (reward.minimumTier && this.currentTier < reward.minimumTier) return false;
  if (reward.pointsCost && this.currentPoints < reward.pointsCost) return false;
  
  return true;
};

const LoyaltyProgram = mongoose.model<ILoyaltyProgram>('LoyaltyProgram', loyaltyProgramSchema);
const CustomerLoyalty = mongoose.model<ICustomerLoyalty>('CustomerLoyalty', customerLoyaltySchema);

export { LoyaltyProgram, CustomerLoyalty };
export default LoyaltyProgram; 