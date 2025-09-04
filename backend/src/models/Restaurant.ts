import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IContact {
  phone: string;
  email: string;
  website?: string;
}

export interface ISocial {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
}

export interface ITheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoPosition: 'left' | 'center' | 'right';
}

export interface ISettings {
  theme: ITheme;
  languages: string[];
  currency: string;
  timezone: string;
  taxRate: number;
  serviceCharge: number;
  autoAcceptOrders: boolean;
  requireCustomerInfo: boolean;
  allowTableSelection: boolean;
  allowDelivery: boolean;
  allowTakeaway: boolean;
  maxDeliveryDistance: number;
  orderPreparationTime: number; // in minutes
}

export interface ISubscription {
  plan: 'basic' | 'premium' | 'enterprise';
  startDate: Date;
  endDate: Date;
  features: string[];
  monthlyPrice: number;
  isActive: boolean;
  paymentMethod: string;
  nextBillingDate: Date;
}

export interface IRestaurant extends Document {
  name: string;
  description: string;
  logo: string;
  banner: string;
  cuisine: string;
  restaurantCode: string; // Unique code for restaurant access
  address: IAddress;
  contact: IContact;
  social: ISocial;
  settings: ISettings;
  ownerId: mongoose.Types.ObjectId;
  isActive: boolean;
  isVerified: boolean;
  subscription: ISubscription;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  monthlyRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
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

const contactSchema = new Schema<IContact>({
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
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  }
});

const socialSchema = new Schema<ISocial>({
  facebook: {
    type: String,
    trim: true
  },
  instagram: {
    type: String,
    trim: true
  },
  twitter: {
    type: String,
    trim: true
  },
  tiktok: {
    type: String,
    trim: true
  },
  youtube: {
    type: String,
    trim: true
  }
});

const themeSchema = new Schema<ITheme>({
  primaryColor: {
    type: String,
    default: '#E85D04',
    match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
  },
  secondaryColor: {
    type: String,
    default: '#F48C06',
    match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
  },
  fontFamily: {
    type: String,
    default: 'Inter',
    enum: ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat']
  },
  logoPosition: {
    type: String,
    default: 'left',
    enum: ['left', 'center', 'right']
  }
});

const settingsSchema = new Schema<ISettings>({
  theme: {
    type: themeSchema,
    default: () => ({})
  },
  languages: [{
    type: String,
    enum: ['en', 'ar', 'de', 'fr', 'es'],
    default: ['en']
  }],
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'QAR', 'KWD']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  serviceCharge: {
    type: Number,
    default: 0,
    min: [0, 'Service charge cannot be negative'],
    max: [100, 'Service charge cannot exceed 100%']
  },
  autoAcceptOrders: {
    type: Boolean,
    default: false
  },
  requireCustomerInfo: {
    type: Boolean,
    default: true
  },
  allowTableSelection: {
    type: Boolean,
    default: true
  },
  allowDelivery: {
    type: Boolean,
    default: true
  },
  allowTakeaway: {
    type: Boolean,
    default: true
  },
  maxDeliveryDistance: {
    type: Number,
    default: 10, // in kilometers
    min: [0, 'Delivery distance cannot be negative']
  },
  orderPreparationTime: {
    type: Number,
    default: 20, // in minutes
    min: [1, 'Preparation time must be at least 1 minute']
  }
});

const subscriptionSchema = new Schema<ISubscription>({
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  features: [{
    type: String,
    enum: [
      'unlimited_products',
      'unlimited_orders',
      'analytics',
      'multi_store',
      'custom_domain',
      'priority_support',
      'api_access',
      'white_label'
    ]
  }],
  monthlyPrice: {
    type: Number,
    default: 29.99
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  nextBillingDate: {
    type: Date,
    required: true
  }
});

const restaurantSchema = new Schema<IRestaurant>({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required'],
    trim: true
  },
  restaurantCode: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    uppercase: true,
    minlength: [6, 'Restaurant code must be at least 6 characters'],
    maxlength: [10, 'Restaurant code cannot exceed 10 characters'],
    match: [/^[A-Z0-9]+$/, 'Restaurant code can only contain uppercase letters and numbers']
  },
  address: {
    type: addressSchema,
    required: true
  },
  contact: {
    type: contactSchema,
    required: true
  },
  social: {
    type: socialSchema,
    default: () => ({})
  },
  settings: {
    type: settingsSchema,
    default: () => ({})
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
restaurantSchema.virtual('averageRating').get(function() {
  return this.totalReviews > 0 ? (this.rating / this.totalReviews).toFixed(1) : 0;
});

// Virtual for subscription status
restaurantSchema.virtual('subscriptionStatus').get(function() {
  if (!this.subscription || !this.subscription.isActive) return 'inactive';
  if (this.subscription.endDate && this.subscription.endDate < new Date()) return 'expired';
  return 'active';
});

// Indexes
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ ownerId: 1 });
restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ 'address.city': 1 });
restaurantSchema.index({ restaurantCode: 1 }, { unique: true });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ totalOrders: -1 });

// Pre-save middleware to set subscription end date
restaurantSchema.pre('save', function(next) {
  if (this.isNew && (!this.subscription || !this.subscription.endDate)) {
    if (!this.subscription) {
      this.subscription = {
        plan: 'basic',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        features: [],
        monthlyPrice: 29.99,
        isActive: true,
        paymentMethod: 'none',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    } else {
      this.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      this.subscription.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

// Static method to find restaurants by location
restaurantSchema.statics.findNearby = function(longitude: number, latitude: number, maxDistance: number = 10) {
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
    isActive: true
  });
};

// Static method to find restaurants by cuisine
restaurantSchema.statics.findByCuisine = function(cuisine: string) {
  return this.find({ 
    cuisine: { $regex: cuisine, $options: 'i' },
    isActive: true 
  });
};

// Static method to find top rated restaurants
restaurantSchema.statics.findTopRated = function(limit: number = 10) {
  return this.find({ isActive: true })
    .sort({ rating: -1, totalReviews: -1 })
    .limit(limit);
};

export default mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
