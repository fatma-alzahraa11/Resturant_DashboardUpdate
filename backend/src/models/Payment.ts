import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'online' | 'mobile_payment';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  gateway: 'stripe' | 'paypal' | 'local' | 'cash';
  transactionId?: string;
  gatewayResponse?: any;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  refundedBy?: mongoose.Types.ObjectId;
  metadata?: {
    cardLast4?: string;
    cardBrand?: string;
    cardCountry?: string;
    billingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    customerEmail?: string;
    customerPhone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const billingAddressSchema = new Schema({
  line1: {
    type: String,
    required: true,
    trim: true
  },
  line2: {
    type: String,
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
  postalCode: {
    type: String,
    required: true,
    trim: true
  }
});

const metadataSchema = new Schema({
  cardLast4: {
    type: String,
    maxlength: 4
  },
  cardBrand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'unionpay']
  },
  cardCountry: {
    type: String,
    trim: true
  },
  billingAddress: {
    type: billingAddressSchema
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    trim: true
  }
});

const paymentSchema = new Schema<IPayment>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'QAR', 'KWD'],
    default: 'USD'
  },
  method: {
    type: String,
    enum: ['cash', 'card', 'online', 'mobile_payment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'local', 'cash'],
    required: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  gatewayResponse: {
    type: Schema.Types.Mixed
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Refund reason cannot exceed 200 characters']
  },
  refundedAt: {
    type: Date
  },
  refundedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: metadataSchema
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for refund status
paymentSchema.virtual('refundStatus').get(function() {
  if (this.status === 'refunded') {
    if (this.refundAmount === this.amount) {
      return 'full_refund';
    } else {
      return 'partial_refund';
    }
  }
  return 'no_refund';
});

// Virtual for payment method display
paymentSchema.virtual('methodDisplay').get(function() {
  const methodDisplay = {
    cash: 'Cash',
    card: 'Credit/Debit Card',
    online: 'Online Payment',
    mobile_payment: 'Mobile Payment'
  };
  return methodDisplay[this.method] || this.method;
});

// Virtual for gateway display
paymentSchema.virtual('gatewayDisplay').get(function() {
  const gatewayDisplay = {
    stripe: 'Stripe',
    paypal: 'PayPal',
    local: 'Local Gateway',
    cash: 'Cash'
  };
  return gatewayDisplay[this.gateway] || this.gateway;
});

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ restaurantId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gateway: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ restaurantId: 1, status: 1 });
paymentSchema.index({ restaurantId: 1, createdAt: -1 });

// Pre-save middleware to validate refund amount
paymentSchema.pre('save', function(next) {
  if (this.isModified('refundAmount') && this.refundAmount) {
    if (this.refundAmount > this.amount) {
      return next(new Error('Refund amount cannot exceed payment amount'));
    }
  }
  next();
});

// Instance method to process refund
paymentSchema.methods.processRefund = async function(
  refundAmount: number, 
  reason: string, 
  refundedBy: string
): Promise<boolean> {
  if (this.status !== 'completed') {
    throw new Error('Payment must be completed to process refund');
  }
  
  if (refundAmount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  if (this.refundAmount && (this.refundAmount + refundAmount) > this.amount) {
    throw new Error('Total refund amount cannot exceed payment amount');
  }
  
  this.refundAmount = (this.refundAmount || 0) + refundAmount;
  this.refundReason = reason;
  this.refundedAt = new Date();
  this.refundedBy = refundedBy;
  
  if (this.refundAmount >= this.amount) {
    this.status = 'refunded';
  }
  
  await this.save();
  return true;
};

// Instance method to cancel payment
paymentSchema.methods.cancelPayment = async function(): Promise<void> {
  if (this.status === 'pending') {
    this.status = 'cancelled';
    await this.save();
  } else {
    throw new Error('Only pending payments can be cancelled');
  }
};

// Instance method to mark as failed
paymentSchema.methods.markAsFailed = async function(failureReason?: string): Promise<void> {
  this.status = 'failed';
  if (failureReason) {
    this.gatewayResponse = { ...this.gatewayResponse, failureReason };
  }
  await this.save();
};

// Static method to find payments by restaurant
paymentSchema.statics.findByRestaurant = function(restaurantId: string, options: {
  status?: string;
  method?: string;
  gateway?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  skip?: number;
} = {}) {
  let query: any = { restaurantId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.method) {
    query.method = options.method;
  }
  
  if (options.gateway) {
    query.gateway = options.gateway;
  }
  
  if (options.dateFrom || options.dateTo) {
    query.createdAt = {};
    if (options.dateFrom) query.createdAt.$gte = options.dateFrom;
    if (options.dateTo) query.createdAt.$lte = options.dateTo;
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

// Static method to find payments by customer
paymentSchema.statics.findByCustomer = function(customerId: string) {
  return this.find({ customerId }).sort({ createdAt: -1 });
};

// Static method to find failed payments
paymentSchema.statics.findFailed = function(restaurantId: string) {
  return this.find({ 
    restaurantId, 
    status: 'failed' 
  }).sort({ createdAt: -1 });
};

// Static method to find refunded payments
paymentSchema.statics.findRefunded = function(restaurantId: string) {
  return this.find({ 
    restaurantId, 
    status: 'refunded' 
  }).sort({ refundedAt: -1 });
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = function(restaurantId: string, dateFrom: Date, dateTo: Date) {
  return this.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: dateFrom, $lte: dateTo }
      }
    },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
        },
        totalRefunded: { $sum: '$refundAmount' }
      }
    }
  ]);
};

// Static method to get payment method statistics
paymentSchema.statics.getMethodStatistics = function(restaurantId: string, dateFrom: Date, dateTo: Date) {
  return this.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        createdAt: { $gte: dateFrom, $lte: dateTo },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

export default mongoose.model<IPayment>('Payment', paymentSchema);
