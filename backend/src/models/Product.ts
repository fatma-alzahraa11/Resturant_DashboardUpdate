import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: {
    en: string;
    ar: string;
    de: string;
  };
  description: {
    en: string;
    ar: string;
    de: string;
  };
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  ingredients: string;
  allergens: string;
  isNewItem?: boolean;
  nutritionalInfo: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  availability: {
    isAvailable: boolean;
    stockQuantity?: number;
    maxOrderQuantity?: number;
  };
  preparation: {
    time: number;
    isPrepared: boolean;
  };
  customization: {
    allowCustomization: boolean;
    options: Array<{
      name: string;
      choices: Array<{
        name: string;
        price: number;
      }>;
      required: boolean;
      maxSelections?: number;
    }>;
  };
  ratings: {
    average: number;
    count: number;
    reviews: Array<{
      customerId: mongoose.Types.ObjectId;
      rating: number;
      comment?: string;
      date: Date;
    }>;
  };
  tags: string[];
  isFeatured: boolean;
  isPopular: boolean;

  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  name: {
    en: { type: String, required: true, trim: true }
  },
  description: {
    en: { type: String, default: '', trim: true }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
     default: 'EUR',
    // enum: ['USD', 'EUR', 'GBP', 'SAR', 'AED']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v) || /^data:image\/.+/.test(v);
      },
      message: 'Invalid image URL or data URL'
    }
  }],
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    // enum: [
    //   'gluten', 'dairy', 'eggs', 'fish', 'shellfish', 'tree_nuts', 
    //   'peanuts', 'wheat', 'soy', 'sulfites', 'none'
    // ]
  }],
  nutritionalInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
    fiber: { type: Number, min: 0 },
    sugar: { type: Number, min: 0 },
    sodium: { type: Number, min: 0 }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    stockQuantity: {
      type: Number,
      min: 0
    },
    maxOrderQuantity: {
      type: Number,
      min: 1,
      default: 10
    }
  },
  preparation: {
    time: {
      type: Number,
      required: true,
      min: 0,
      default: 15
    },
    isPrepared: {
      type: Boolean,
      default: false
    }
  },
  customization: {
    allowCustomization: {
      type: Boolean,
      default: false
    },
    options: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      choices: [{
        name: {
          type: String,
          required: true,
          trim: true
        },
        price: {
          type: Number,
          default: 0,
          min: 0
        }
      }],
      required: {
        type: Boolean,
        default: false
      },
      maxSelections: {
        type: Number,
        min: 1
      }
    }]
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    reviews: [{
      customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true,
        maxlength: 500
      },
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  tags: [{
    type: String,
    trim: true
  }],
  isNewItem: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },

  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProductSchema.index({ restaurantId: 1, categoryId: 1 });
ProductSchema.index({ restaurantId: 1, isAvailable: 1 });
ProductSchema.index({ restaurantId: 1, isNewItem: 1 });
ProductSchema.index({ restaurantId: 1, isFeatured: 1 });
ProductSchema.index({ restaurantId: 1, isPopular: 1 });

ProductSchema.index({ 'availability.isAvailable': 1 });
ProductSchema.index({ 'ratings.average': -1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema); 