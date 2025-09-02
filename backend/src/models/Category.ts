import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryName {
  en: string;
  ar: string;
  de: string;
  fr?: string;
  es?: string;
}

export interface ICategoryDescription {
  en: string;
  ar: string;
  de: string;
  fr?: string;
  es?: string;
}

export interface ICategory extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: ICategoryName;
  description: ICategoryDescription;
  image: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const categoryNameSchema = new Schema<ICategoryName>({
  en: {
    type: String,
    required: [true, 'English name is required'],
    trim: true,
    maxlength: [50, 'English name cannot exceed 50 characters']
  },
  ar: {
    type: String,
    required: [false, 'Arabic name is required'],
    trim: true,
    maxlength: [50, 'Arabic name cannot exceed 50 characters']
  },
  de: {
    type: String,
    required: [false, 'German name is required'],
    trim: true,
    maxlength: [50, 'German name cannot exceed 50 characters']
  },
  fr: {
    type: String,
    trim: true,
    maxlength: [50, 'French name cannot exceed 50 characters']
  },
  es: {
    type: String,
    trim: true,
    maxlength: [50, 'Spanish name cannot exceed 50 characters']
  }
});

const categoryDescriptionSchema = new Schema<ICategoryDescription>({
  en: {
    type: String,
    trim: true,
    maxlength: [200, 'English description cannot exceed 200 characters']
  },
  ar: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic description cannot exceed 200 characters']
  },
  de: {
    type: String,
    trim: true,
    maxlength: [200, 'German description cannot exceed 200 characters']
  },
  fr: {
    type: String,
    trim: true,
    maxlength: [200, 'French description cannot exceed 200 characters']
  },
  es: {
    type: String,
    trim: true,
    maxlength: [200, 'Spanish description cannot exceed 200 characters']
  }
});

const categorySchema = new Schema<ICategory>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: categoryNameSchema,
    required: true
  },
  description: {
    type: categoryDescriptionSchema,
    default: () => ({})
  },
  image: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    enum: [
      '🍕', '🍔', '🍟', '🌭', '🌮', '🌯', '🥗', '🥪', '🥙', '🥨',
      '🍖', '🍗', '🥩', '🥓', '🍜', '🍝', '🍛', '🍣', '🍱', '🥟',
      '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨',
      '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍩',
      '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃',
      '🥤', '🧋', '🍶', '🍺', '🍷', '🍸', '🍹', '🍾', '🥂', '🥃',
      '🍻', '🥂', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🍾',
      '🍽️'
    ],
    default: '🍽️'
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: [0, 'Sort order cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  productCount: {
    type: Number,
    default: 0,
    min: [0, 'Product count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for localized name based on language
categorySchema.virtual('localizedName').get(function (this: any) {
  const self = this;
  return function (lang: string = 'en') {
    return self.name[lang] || self.name.en;
  };
});

// Virtual for localized description based on language
categorySchema.virtual('localizedDescription').get(function (this: any) {
  const self = this;
  return function (lang: string = 'en') {
    return self.description[lang] || self.description.en;
  };
});

// Virtual for display name (with product count)
categorySchema.virtual('displayName').get(function (this: any) {
  const self = this;
  return function (lang: string = 'en') {
    const name = self.name[lang] || self.name.en;
    return self.productCount > 0 ? `${name} (${self.productCount})` : name;
  };
});

// Indexes
categorySchema.index({ restaurantId: 1 });
categorySchema.index({ restaurantId: 1, isActive: 1 });
categorySchema.index({ restaurantId: 1, sortOrder: 1 });
categorySchema.index({ restaurantId: 1, isFeatured: 1 });
categorySchema.index({ 'name.en': 'text' });

// Pre-save middleware to auto-increment sort order if not provided
categorySchema.pre('save', async function (next) {
  try {
    if (this.isNew && this.sortOrder === 0) {
      const lastCategory = await mongoose.model('Category').findOne(
        { restaurantId: this.restaurantId },
        {},
        { sort: { sortOrder: -1 } }
      );
      this.sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;
    }
    next();
  } catch (error) {
    console.error('Error in category sort order middleware:', error);
    // Continue with save even if sort order update fails
    next();
  }
});

// Pre-save middleware to update product count
categorySchema.pre('save', async function (next) {
  try {
    if (this.isModified('isActive') || this.isNew) {
      const Product = mongoose.model('Product');
      const count = await Product.countDocuments({
        categoryId: this._id,
        'availability.isAvailable': true
      });
      this.productCount = count;
    }
    next();
  } catch (error) {
    console.error('Error in category pre-save middleware:', error);
    // Continue with save even if product count update fails
    next();
  }
});

// Instance method to get localized name
categorySchema.methods.getName = function (lang: string = 'en'): string {
  return this.name[lang] || this.name.en;
};

// Instance method to get localized description
categorySchema.methods.getDescription = function (lang: string = 'en'): string {
  return this.description[lang] || this.description.en;
};

// Instance method to update product count
categorySchema.methods.updateProductCount = async function (): Promise<number> {
  try {
    const Product = mongoose.model('Product');
    const count = await Product.countDocuments({
      categoryId: this._id,
      'availability.isAvailable': true
    });
    this.productCount = count;
    await this.save();
    return count;
  } catch (error) {
    console.error('Error updating product count:', error);
    return this.productCount || 0;
  }
};

// Instance method to reorder categories
categorySchema.methods.reorder = async function (newOrder: number): Promise<void> {
  const Category = mongoose.model('Category');

  if (newOrder < this.sortOrder) {
    // Moving up - increment sort order of categories between newOrder and current sortOrder
    await Category.updateMany(
      {
        restaurantId: this.restaurantId,
        sortOrder: { $gte: newOrder, $lt: this.sortOrder }
      },
      { $inc: { sortOrder: 1 } }
    );
  } else if (newOrder > this.sortOrder) {
    // Moving down - decrement sort order of categories between current sortOrder and newOrder
    await Category.updateMany(
      {
        restaurantId: this.restaurantId,
        sortOrder: { $gt: this.sortOrder, $lte: newOrder }
      },
      { $inc: { sortOrder: -1 } }
    );
  }

  this.sortOrder = newOrder;
  await this.save();
};

// Static method to find categories by restaurant
categorySchema.statics.findByRestaurant = function (restaurantId: string, options: {
  activeOnly?: boolean;
  featuredOnly?: boolean;
  withProducts?: boolean;
} = {}) {
  let query: any = { restaurantId };

  if (options.activeOnly) {
    query.isActive = true;
  }

  if (options.featuredOnly) {
    query.isFeatured = true;
  }

  let result = this.find(query).sort({ sortOrder: 1, name: 1 });

  if (options.withProducts) {
    result = result.populate({
      path: 'products',
      match: { 'availability.isAvailable': true },
      options: { sort: { sortOrder: 1 } }
    });
  }

  return result;
};

// Static method to find categories with product count
categorySchema.statics.findWithProductCount = function (restaurantId: string) {
  return this.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId), isActive: true } },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'categoryId',
        pipeline: [
          { $match: { 'availability.isAvailable': true } }
        ],
        as: 'products'
      }
    },
    {
      $addFields: {
        productCount: { $size: '$products' }
      }
    },
    { $sort: { sortOrder: 1, name: 1 } },
    { $project: { products: 0 } }
  ]);
};

// Static method to search categories
categorySchema.statics.search = function (restaurantId: string, searchTerm: string, lang: string = 'en') {
  const searchField = `name.${lang}`;
  return this.find({
    restaurantId,
    isActive: true,
    [searchField]: { $regex: searchTerm, $options: 'i' }
  }).sort({ sortOrder: 1 });
};

// Static method to reorder all categories
categorySchema.statics.reorderCategories = async function (restaurantId: string, categoryIds: string[]): Promise<void> {
  const updates = categoryIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, restaurantId },
      update: { sortOrder: index + 1 }
    }
  }));

  await this.bulkWrite(updates);
};

export default mongoose.model<ICategory>('Category', categorySchema);
