import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  nameAr?: string;
  nameDe?: string;
  price: number;
  quantity: number;
  addOns: {
    name: string;
    nameAr?: string;
    nameDe?: string;
    price: number;
    quantity: number;
  }[];
  notes: string;
  totalPrice: number;
  preparationTime?: number;
}

export interface IDeliveryAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: [number, number]; // [longitude, latitude]
  instructions: string;
  contactPhone: string;
  contactName: string;
}

export interface IPayment {
  method: 'cash' | 'card' | 'online' | 'mobile_payment';
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  amount: number;
  tip?: number;
  gateway?: 'stripe' | 'paypal' | 'local';
  gatewayResponse?: any;
  paidAt?: Date;
}

export interface ITotals {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  tip: number;
  total: number;
}

export interface IDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  appliedAt: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  restaurantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: IOrderItem[];
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  deliveryAddress?: IDeliveryAddress;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'delivered';
  payment: IPayment;
  totals: ITotals;
  discount?: IDiscount;
  estimatedTime?: Date;
  actualTime?: Date;
  assignedTo?: mongoose.Types.ObjectId; // Staff member assigned to order
  notes?: string;
  customerNotes?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameAr: {
    type: String,
    trim: true
  },
  nameDe: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  addOns: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    nameAr: {
      type: String,
      trim: true
    },
    nameDe: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Add-on price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Add-on quantity must be at least 1']
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Item notes cannot exceed 200 characters']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  preparationTime: {
    type: Number,
    min: [1, 'Preparation time must be at least 1 minute']
  }
});

const deliveryAddressSchema = new Schema<IDeliveryAddress>({
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
  instructions: {
    type: String,
    trim: true,
    maxlength: [300, 'Delivery instructions cannot exceed 300 characters']
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true
  }
});

const paymentSchema = new Schema<IPayment>({
  method: {
    type: String,
    enum: ['cash', 'card', 'online', 'mobile_payment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount cannot be negative']
  },
  tip: {
    type: Number,
    min: [0, 'Tip cannot be negative']
  },
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'local']
  },
  gatewayResponse: {
    type: Schema.Types.Mixed
  },
  paidAt: {
    type: Date
  }
});

const totalsSchema = new Schema<ITotals>({
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative']
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: [0, 'Delivery fee cannot be negative']
  },
  discount: {
    type: Number,
    required: true,
    min: [0, 'Discount cannot be negative']
  },
  tip: {
    type: Number,
    required: true,
    min: [0, 'Tip cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
});

const discountSchema = new Schema<IDiscount>({
  code: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Discount value cannot be negative']
  },
  description: {
    type: String,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  items: [{
    type: orderItemSchema,
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  }],
  orderType: {
    type: String,
    enum: ['dine_in', 'takeaway', 'delivery'],
    required: true
  },
  tableNumber: {
    type: String,
    trim: true,
    required: function() {
      return this.orderType === 'dine_in';
    }
  },
  deliveryAddress: {
    type: deliveryAddressSchema,
    required: function() {
      return this.orderType === 'delivery';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled', 'delivered'],
    default: 'pending'
  },
  payment: {
    type: paymentSchema,
    required: true
  },
  totals: {
    type: totalsSchema,
    required: true
  },
  discount: {
    type: discountSchema
  },
  estimatedTime: {
    type: Date
  },
  actualTime: {
    type: Date
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  customerNotes: {
    type: String,
    trim: true,
    maxlength: [300, 'Customer notes cannot exceed 300 characters']
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Internal notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order duration
orderSchema.virtual('duration').get(function() {
  if (this.actualTime && this.createdAt) {
    return Math.round((this.actualTime.getTime() - this.createdAt.getTime()) / (1000 * 60)); // in minutes
  }
  return null;
});

// Virtual for estimated completion time
orderSchema.virtual('estimatedCompletionTime').get(function() {
  if (this.estimatedTime) {
    return this.estimatedTime;
  }
  if (this.createdAt) {
    const avgPreparationTime = this.items.reduce((total, item) => total + (item.preparationTime || 15), 0);
    return new Date(this.createdAt.getTime() + avgPreparationTime * 60 * 1000);
  }
  return null;
});

// Virtual for order status timeline
orderSchema.virtual('statusTimeline').get(function() {
  const timeline = [];
  
  if (this.createdAt) {
    timeline.push({ status: 'created', time: this.createdAt });
  }
  
  if (this.status === 'confirmed' || this.status === 'preparing' || this.status === 'ready' || this.status === 'served' || this.status === 'delivered') {
    timeline.push({ status: 'confirmed', time: this.updatedAt });
  }
  
  if (this.status === 'preparing' || this.status === 'ready' || this.status === 'served' || this.status === 'delivered') {
    timeline.push({ status: 'preparing', time: this.updatedAt });
  }
  
  if (this.status === 'ready' || this.status === 'served' || this.status === 'delivered') {
    timeline.push({ status: 'ready', time: this.updatedAt });
  }
  
  if (this.status === 'served' || this.status === 'delivered') {
    timeline.push({ status: 'served', time: this.updatedAt });
  }
  
  if (this.status === 'delivered') {
    timeline.push({ status: 'delivered', time: this.updatedAt });
  }
  
  return timeline;
});

// Indexes
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ storeId: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ storeId: 1, status: 1 });
orderSchema.index({ 'customerInfo.phone': 1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ assignedTo: 1 });
orderSchema.index({ 'payment.status': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of orders for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const orderCount = await mongoose.model('Order').countDocuments({
      restaurantId: this.restaurantId,
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    this.orderNumber = `ORD-${year}${month}${day}-${String(orderCount + 1).padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('discount') || this.isNew) {
    // Calculate subtotal
    this.totals.subtotal = this.items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const addOnsTotal = item.addOns.reduce((addOnTotal, addOn) => {
        return addOnTotal + (addOn.price * addOn.quantity);
      }, 0);
      return total + itemTotal + addOnsTotal;
    }, 0);
    
    // Apply discount
    if (this.discount) {
      if (this.discount.type === 'percentage') {
        this.totals.discount = (this.totals.subtotal * this.discount.value) / 100;
      } else {
        this.totals.discount = this.discount.value;
      }
    } else {
      this.totals.discount = 0;
    }
    
    // Calculate tax (assuming 10% tax rate - should come from restaurant settings)
    this.totals.tax = (this.totals.subtotal - this.totals.discount) * 0.1;
    
    // Calculate delivery fee (should come from store settings)
    this.totals.deliveryFee = this.orderType === 'delivery' ? 2.99 : 0;
    
    // Calculate total
    this.totals.total = this.totals.subtotal - this.totals.discount + this.totals.tax + this.totals.deliveryFee + (this.payment.tip || 0);
  }
  next();
});

// Instance method to update status
orderSchema.methods.updateStatus = async function(newStatus: string, assignedTo?: string): Promise<void> {
  this.status = newStatus;
  if (assignedTo) {
    this.assignedTo = assignedTo;
  }
  
  if (newStatus === 'served' || newStatus === 'delivered') {
    this.actualTime = new Date();
  }
  
  await this.save();
};

// Instance method to add item
orderSchema.methods.addItem = function(item: IOrderItem): void {
  this.items.push(item);
};

// Instance method to remove item
orderSchema.methods.removeItem = function(itemIndex: number): boolean {
  if (itemIndex >= 0 && itemIndex < this.items.length) {
    this.items.splice(itemIndex, 1);
    return true;
  }
  return false;
};

// Instance method to apply discount
orderSchema.methods.applyDiscount = function(discountCode: string, discountType: 'percentage' | 'fixed', discountValue: number, description?: string): void {
  this.discount = {
    code: discountCode,
    type: discountType,
    value: discountValue,
    description,
    appliedAt: new Date()
  };
};

// Instance method to remove discount
orderSchema.methods.removeDiscount = function(): void {
  this.discount = undefined;
};

// Static method to find orders by restaurant
orderSchema.statics.findByRestaurant = function(restaurantId: string, options: {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  limit?: number;
  skip?: number;
} = {}) {
  let query: any = { restaurantId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.dateFrom || options.dateTo) {
    query.createdAt = {};
    if (options.dateFrom) query.createdAt.$gte = options.dateFrom;
    if (options.dateTo) query.createdAt.$lte = options.dateTo;
  }
  
  if (options.customerId) {
    query.customerId = options.customerId;
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

// Static method to find orders by store
orderSchema.statics.findByStore = function(storeId: string, options: {
  status?: string;
  todayOnly?: boolean;
  limit?: number;
} = {}) {
  let query: any = { storeId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.todayOnly) {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    query.createdAt = { $gte: todayStart, $lt: todayEnd };
  }
  
  let result = this.find(query).sort({ createdAt: -1 });
  
  if (options.limit) {
    result = result.limit(options.limit);
  }
  
  return result;
};

// Static method to find pending orders
orderSchema.statics.findPending = function(restaurantId: string) {
  return this.find({
    restaurantId,
    status: { $in: ['pending', 'confirmed', 'preparing'] }
  }).sort({ createdAt: 1 });
};

// Static method to get order statistics
orderSchema.statics.getStatistics = function(restaurantId: string, dateFrom: Date, dateTo: Date) {
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
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totals.total' },
        averageOrderValue: { $avg: '$totals.total' },
        pendingOrders: {
          $sum: { $cond: [{ $in: ['$status', ['pending', 'confirmed', 'preparing']] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $in: ['$status', ['served', 'delivered']] }, 1, 0] }
        }
      }
    }
  ]);
};

export default mongoose.model<IOrder>('Order', orderSchema);
