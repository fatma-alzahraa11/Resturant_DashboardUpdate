import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscountName {
  en: string;
  ar: string;
  de: string;
  fr?: string;
  es?: string;
}

export interface IDiscountDescription {
  en: string;
  ar: string;
  de: string;
  fr?: string;
  es?: string;
}

export interface IDiscountRule {
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping';
  value: number;
  minimumOrder?: number;
  maximumDiscount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  freeProductId?: mongoose.Types.ObjectId;
}

export interface IDiscountTarget {
  type: 'all_products' | 'specific_products' | 'specific_categories' | 'specific_customers';
  productIds?: mongoose.Types.ObjectId[];
  categoryIds?: mongoose.Types.ObjectId[];
  customerIds?: mongoose.Types.ObjectId[];
  customerGroups?: string[]; // 'new', 'loyal', 'vip'
}

export interface IDiscountSchedule {
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    timeSlots?: {
      startTime: string; // HH:MM
      endTime: string; // HH:MM
    }[];
  };
}

export interface IDiscountUsage {
  customerId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  discountAmount: number;
  usedAt: Date;
}

export interface IDiscount extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: IDiscountName;
  description: IDiscountDescription;
  code?: string; // Optional coupon code
  rule: IDiscountRule;
  target: IDiscountTarget;
  schedule: IDiscountSchedule;
  image?: string;
  isActive: boolean;
  isPublic: boolean; // Whether to show on public menu
  usageLimit?: number; // Total usage limit
  usageCount: number;
  customerUsageLimit?: number; // Per customer usage limit
  customerUsage: {
    customerId: mongoose.Types.ObjectId;
    usageCount: number;
    lastUsedAt: Date;
  }[];
  priority: number; // Higher priority discounts applied first
  conditions?: {
    minimumOrderAmount?: number;
    maximumOrderAmount?: number;
    customerType?: string[];
    excludedProducts?: mongoose.Types.ObjectId[];
    excludedCategories?: mongoose.Types.ObjectId[];
  };
  usageHistory: IDiscountUsage[];
  createdAt: Date;
  updatedAt: Date;
}

const discountNameSchema = new Schema<IDiscountName>({
  en: {
    type: String,
    required: [true, 'English name is required'],
    trim: true,
    maxlength: [100, 'English name cannot exceed 100 characters']
  },
  ar: {
    type: String,
    required: [true, 'Arabic name is required'],
    trim: true,
    maxlength: [100, 'Arabic name cannot exceed 100 characters']
  },
  de: {
    type: String,
    required: [true, 'German name is required'],
    trim: true,
    maxlength: [100, 'German name cannot exceed 100 characters']
  },
  fr: {
    type: String,
    trim: true,
    maxlength: [100, 'French name cannot exceed 100 characters']
  },
  es: {
    type: String,
    trim: true,
    maxlength: [100, 'Spanish name cannot exceed 100 characters']
  }
});

const discountDescriptionSchema = new Schema<IDiscountDescription>({
  en: {
    type: String,
    trim: true,
    maxlength: [500, 'English description cannot exceed 500 characters']
  },
  ar: {
    type: String,
    trim: true,
    maxlength: [500, 'Arabic description cannot exceed 500 characters']
  },
  de: {
    type: String,
    trim: true,
    maxlength: [500, 'German description cannot exceed 500 characters']
  },
  fr: {
    type: String,
    trim: true,
    maxlength: [500, 'French description cannot exceed 500 characters']
  },
  es: {
    type: String,
    trim: true,
    maxlength: [500, 'Spanish description cannot exceed 500 characters']
  }
});

const discountRuleSchema = new Schema<IDiscountRule>({
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'buy_x_get_y', 'free_shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Discount value must be positive']
  },
  minimumOrder: {
    type: Number,
    min: [0, 'Minimum order must be positive']
  },
  maximumDiscount: {
    type: Number,
    min: [0, 'Maximum discount must be positive']
  },
  buyQuantity: {
    type: Number,
    min: [1, 'Buy quantity must be at least 1']
  },
  getQuantity: {
    type: Number,
    min: [1, 'Get quantity must be at least 1']
  },
  freeProductId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }
});

const discountTargetSchema = new Schema<IDiscountTarget>({
  type: {
    type: String,
    enum: ['all_products', 'specific_products', 'specific_categories', 'specific_customers'],
    required: true
  },
  productIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  categoryIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  customerIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  customerGroups: [{
    type: String,
    enum: ['new', 'loyal', 'vip']
  }]
});

const discountScheduleSchema = new Schema<IDiscountSchedule>({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    timeSlots: [{
      startTime: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
      },
      endTime: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
      }
    }]
  }
});

const discountUsageSchema = new Schema<IDiscountUsage>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  discountAmount: {
    type: Number,
    required: true,
    min: [0, 'Discount amount must be positive']
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
});

const customerUsageSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  }
});

const discountConditionsSchema = new Schema({
  minimumOrderAmount: {
    type: Number,
    min: [0, 'Minimum order amount must be positive']
  },
  maximumOrderAmount: {
    type: Number,
    min: [0, 'Maximum order amount must be positive']
  },
  customerType: [{
    type: String,
    enum: ['new', 'returning', 'vip', 'loyal']
  }],
  excludedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }]
});

const discountSchema = new Schema<IDiscount>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: discountNameSchema,
    required: true
  },
  description: {
    type: discountDescriptionSchema,
    required: true
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true,
    match: [/^[A-Z0-9]{3,20}$/, 'Code must be 3-20 characters, letters and numbers only']
  },
  rule: {
    type: discountRuleSchema,
    required: true
  },
  target: {
    type: discountTargetSchema,
    required: true
  },
  schedule: {
    type: discountScheduleSchema,
    required: true
  },
  image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
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
  customerUsageLimit: {
    type: Number,
    min: [1, 'Customer usage limit must be at least 1']
  },
  customerUsage: [customerUsageSchema],
  priority: {
    type: Number,
    default: 0,
    min: [0, 'Priority cannot be negative']
  },
  conditions: discountConditionsSchema,
  usageHistory: [discountUsageSchema]
}, {
  timestamps: true
});

// Indexes for performance
discountSchema.index({ restaurantId: 1, isActive: 1 });
discountSchema.index({ code: 1 });
discountSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
discountSchema.index({ isPublic: 1, isActive: 1 });

// Pre-save middleware to validate dates
discountSchema.pre('save', function(next) {
  if (this.schedule.startDate >= this.schedule.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

// Method to check if discount is currently valid
discountSchema.methods.isValid = function(): boolean {
  const now = new Date();
  return this.isActive && 
         this.schedule.startDate <= now && 
         this.schedule.endDate >= now &&
         (!this.usageLimit || this.usageCount < this.usageLimit);
};

// Method to check if customer can use this discount
discountSchema.methods.canCustomerUse = function(customerId: mongoose.Types.ObjectId): boolean {
  if (!this.isValid()) return false;
  
  const customerUsage = this.customerUsage.find(
    (usage: any) => usage.customerId.toString() === customerId.toString()
  );
  
  if (this.customerUsageLimit && customerUsage && customerUsage.usageCount >= this.customerUsageLimit) {
    return false;
  }
  
  return true;
};

// Method to apply discount to order
discountSchema.methods.calculateDiscount = function(orderItems: any[], orderTotal: number): number {
  if (!this.isValid()) return 0;
  
  let applicableItems = orderItems;
  
  // Filter items based on target
  if (this.target.type === 'specific_products') {
    applicableItems = orderItems.filter(item => 
      this.target.productIds?.includes(item.productId)
    );
  } else if (this.target.type === 'specific_categories') {
    applicableItems = orderItems.filter(item => 
      this.target.categoryIds?.includes(item.categoryId)
    );
  }
  
  if (applicableItems.length === 0) return 0;
  
  const applicableTotal = applicableItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Check minimum order amount
  if (this.conditions?.minimumOrderAmount && orderTotal < this.conditions.minimumOrderAmount) {
    return 0;
  }
  
  // Check maximum order amount
  if (this.conditions?.maximumOrderAmount && orderTotal > this.conditions.maximumOrderAmount) {
    return 0;
  }
  
  let discountAmount = 0;
  
  switch (this.rule.type) {
    case 'percentage':
      discountAmount = (applicableTotal * this.rule.value) / 100;
      break;
    case 'fixed':
      discountAmount = this.rule.value;
      break;
    case 'buy_x_get_y':
      // Complex logic for buy X get Y
      discountAmount = 0;
      break;
    case 'free_shipping':
      // Handle shipping discount
      discountAmount = 0;
      break;
    default:
      discountAmount = 0;
      break;
  }
  
  // Apply maximum discount limit
  if (this.rule.maximumDiscount && discountAmount > this.rule.maximumDiscount) {
    discountAmount = this.rule.maximumDiscount;
  }
  
  return Math.min(discountAmount, applicableTotal);
};

const Discount = mongoose.model<IDiscount>('Discount', discountSchema);

export default Discount; 