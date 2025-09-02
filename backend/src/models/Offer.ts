import mongoose, { Document, Schema } from 'mongoose';

export interface IOfferProduct {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
}

export interface IOffer extends Document {
  restaurantId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  products: IOfferProduct[];
  isAvailable: boolean;
  validFrom?: Date;
  validUntil?: Date;
  maxRedemptions?: number;
  currentRedemptions: number;
  tags: string[];
  sortOrder: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  canRedeem(): boolean;
  redeem(): Promise<IOffer>;
}

const offerProductSchema = new Schema<IOfferProduct>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['Number', 'KG', 'None'],
    default: 'Number'
  }
});

const offerSchema = new Schema<IOffer>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  title: {
    type: String,
    required: [true, 'Offer title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be a positive number'],
    validate: {
      validator: function(this: IOffer, value: number) {
        return !value || value >= this.price;
      },
      message: 'Original price must be greater than or equal to current price'
    }
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR',
    enum: ['EUR', 'USD', 'GBP', 'SAR', 'AED']
  },
  products: {
    type: [offerProductSchema],
    required: [true, 'At least one product is required'],
    validate: {
      validator: function(products: IOfferProduct[]) {
        return products.length > 0;
      },
      message: 'Offer must include at least one product'
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    validate: {
      validator: function(this: IOffer, value: Date) {
        return !value || !this.validFrom || value > this.validFrom;
      },
      message: 'Valid until date must be after valid from date'
    }
  },
  maxRedemptions: {
    type: Number,
    min: [0, 'Max redemptions must be a positive number']
  },
  currentRedemptions: {
    type: Number,
    default: 0,
    min: [0, 'Current redemptions cannot be negative']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  sortOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user ID is required']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
offerSchema.index({ restaurantId: 1, isAvailable: 1 });
offerSchema.index({ storeId: 1, isAvailable: 1 });
offerSchema.index({ validFrom: 1, validUntil: 1 });
offerSchema.index({ sortOrder: 1 });
offerSchema.index({ createdAt: -1 });

// Virtual for checking if offer is currently valid
offerSchema.virtual('isValid').get(function(this: IOffer) {
  const now = new Date();
  const validFromCheck = !this.validFrom || this.validFrom <= now;
  const validUntilCheck = !this.validUntil || this.validUntil >= now;
  const redemptionCheck = !this.maxRedemptions || this.currentRedemptions < this.maxRedemptions;
  
  return this.isAvailable && validFromCheck && validUntilCheck && redemptionCheck;
});

// Virtual for discount percentage (if originalPrice exists)
offerSchema.virtual('discountPercentage').get(function(this: IOffer) {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Virtual for savings amount
offerSchema.virtual('savingsAmount').get(function(this: IOffer) {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return this.originalPrice - this.price;
});

// Pre-save middleware to update sortOrder and updatedBy
offerSchema.pre('save', function(this: IOffer, next) {
  if (this.isNew && this.sortOrder === 0) {
    // Set sortOrder based on creation time if not specified
    this.sortOrder = Date.now();
  }
  next();
});

// Pre-update middleware
offerSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function() {
  this.set({ updatedAt: new Date() });
});

// Static method to find active offers
offerSchema.statics.findActiveOffers = function(restaurantId: string, storeId?: string) {
  const now = new Date();
  const query: any = {
    restaurantId,
    isAvailable: true,
    $and: [
      {
        $or: [
          { validFrom: { $exists: false } },
          { validFrom: { $lte: now } }
        ]
      },
      {
        $or: [
          { validUntil: { $exists: false } },
          { validUntil: { $gte: now } }
        ]
      }
    ]
  };
  
  if (storeId) {
    query.storeId = storeId;
  }
  
  return this.find(query)
    .populate('products.productId', 'name price')
    .sort({ sortOrder: 1, createdAt: -1 });
};

// Instance method to check if offer can be redeemed
offerSchema.methods.canRedeem = function(this: IOffer): boolean {
  const now = new Date();
  const validFromCheck = !this.validFrom || this.validFrom <= now;
  const validUntilCheck = !this.validUntil || this.validUntil >= now;
  const redemptionCheck = !this.maxRedemptions || this.currentRedemptions < this.maxRedemptions;
  
  return this.isAvailable && validFromCheck && validUntilCheck && redemptionCheck;
};

// Instance method to redeem offer
offerSchema.methods.redeem = function(this: IOffer): Promise<IOffer> {
  if (!this.canRedeem()) {
    throw new Error('Offer cannot be redeemed');
  }
  
  this.currentRedemptions += 1;
  return this.save();
};

const Offer = mongoose.model<IOffer>('Offer', offerSchema);

export default Offer;
