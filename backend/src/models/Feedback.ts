import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  orderId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  rating: number; // 1-5
  review: string;
  categories: {
    food: number;
    service: number;
    ambiance: number;
    value: number;
  };
  images?: string[];
  isPublic: boolean;
  isResponded: boolean;
  response?: {
    text: string;
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
  };
  helpfulCount: number;
  reportCount: number;
  isReported: boolean;
  reportReason?: string;
  isModerated: boolean;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categoriesSchema = new Schema({
  food: {
    type: Number,
    required: true,
    min: [1, 'Food rating must be at least 1'],
    max: [5, 'Food rating cannot exceed 5']
  },
  service: {
    type: Number,
    required: true,
    min: [1, 'Service rating must be at least 1'],
    max: [5, 'Service rating cannot exceed 5']
  },
  ambiance: {
    type: Number,
    required: true,
    min: [1, 'Ambiance rating must be at least 1'],
    max: [5, 'Ambiance rating cannot exceed 5']
  },
  value: {
    type: Number,
    required: true,
    min: [1, 'Value rating must be at least 1'],
    max: [5, 'Value rating cannot exceed 5']
  }
});

const responseSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Response text cannot exceed 500 characters']
  },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  respondedAt: {
    type: Date,
    default: Date.now
  }
});

const feedbackSchema = new Schema<IFeedback>({
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
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    maxlength: [1000, 'Review text cannot exceed 1000 characters']
  },
  categories: {
    type: categoriesSchema,
    required: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL'
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isResponded: {
    type: Boolean,
    default: false
  },
  response: {
    type: responseSchema
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative']
  },
  reportCount: {
    type: Number,
    default: 0,
    min: [0, 'Report count cannot be negative']
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Report reason cannot exceed 200 characters']
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Moderation reason cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average category rating
feedbackSchema.virtual('averageCategoryRating').get(function() {
  const { food, service, ambiance, value } = this.categories;
  return ((food + service + ambiance + value) / 4).toFixed(1);
});

// Virtual for rating display (stars)
feedbackSchema.virtual('ratingDisplay').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Virtual for sentiment analysis
feedbackSchema.virtual('sentiment').get(function() {
  if (this.rating >= 4) return 'positive';
  if (this.rating >= 3) return 'neutral';
  return 'negative';
});

// Virtual for review status
feedbackSchema.virtual('status').get(function() {
  if (this.isModerated) return 'moderated';
  if (this.isReported) return 'reported';
  if (this.isPublic) return 'public';
  return 'private';
});

// Indexes
feedbackSchema.index({ orderId: 1 });
feedbackSchema.index({ restaurantId: 1 });
feedbackSchema.index({ customerId: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ restaurantId: 1, rating: 1 });
feedbackSchema.index({ restaurantId: 1, createdAt: -1 });
feedbackSchema.index({ isPublic: 1 });
feedbackSchema.index({ isModerated: 1 });
feedbackSchema.index({ isReported: 1 });
feedbackSchema.index({ 'categories.food': 1 });
feedbackSchema.index({ 'categories.service': 1 });
feedbackSchema.index({ 'categories.ambiance': 1 });
feedbackSchema.index({ 'categories.value': 1 });

// Pre-save middleware to validate rating consistency
feedbackSchema.pre('save', function(next) {
  const avgCategoryRating = (this.categories.food + this.categories.service + 
                           this.categories.ambiance + this.categories.value) / 4;
  
  // Allow some variance between overall rating and category average
  if (Math.abs(this.rating - avgCategoryRating) > 2) {
    return next(new Error('Overall rating should be consistent with category ratings'));
  }
  next();
});

// Instance method to add response
feedbackSchema.methods.addResponse = function(responseText: string, respondedBy: string): void {
  this.response = {
    text: responseText,
    respondedBy,
    respondedAt: new Date()
  };
  this.isResponded = true;
};

// Instance method to update response
feedbackSchema.methods.updateResponse = function(responseText: string): void {
  if (this.response) {
    this.response.text = responseText;
    this.response.respondedAt = new Date();
  }
};

// Instance method to remove response
feedbackSchema.methods.removeResponse = function(): void {
  this.response = undefined;
  this.isResponded = false;
};

// Instance method to mark as helpful
feedbackSchema.methods.markHelpful = function(): void {
  this.helpfulCount += 1;
};

// Instance method to report feedback
feedbackSchema.methods.report = function(reason: string): void {
  this.reportCount += 1;
  this.isReported = true;
  this.reportReason = reason;
};

// Instance method to moderate feedback
feedbackSchema.methods.moderate = function(
  moderatedBy: string, 
  reason: string, 
  isPublic: boolean = false
): void {
  this.isModerated = true;
  this.moderatedBy = moderatedBy;
  this.moderatedAt = new Date();
  this.moderationReason = reason;
  this.isPublic = isPublic;
};

// Instance method to approve feedback
feedbackSchema.methods.approve = function(moderatedBy: string): void {
  this.isModerated = false;
  this.isReported = false;
  this.isPublic = true;
  this.moderatedBy = undefined;
  this.moderatedAt = undefined;
  this.moderationReason = undefined;
  this.reportReason = undefined;
};

// Static method to find feedback by restaurant
feedbackSchema.statics.findByRestaurant = function(restaurantId: string, options: {
  rating?: number;
  isPublic?: boolean;
  isModerated?: boolean;
  isReported?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  skip?: number;
} = {}) {
  let query: any = { restaurantId };
  
  if (options.rating) {
    query.rating = options.rating;
  }
  
  if (options.isPublic !== undefined) {
    query.isPublic = options.isPublic;
  }
  
  if (options.isModerated !== undefined) {
    query.isModerated = options.isModerated;
  }
  
  if (options.isReported !== undefined) {
    query.isReported = options.isReported;
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

// Static method to find feedback by customer
feedbackSchema.statics.findByCustomer = function(customerId: string) {
  return this.find({ customerId }).sort({ createdAt: -1 });
};

// Static method to find positive feedback
feedbackSchema.statics.findPositive = function(restaurantId: string, limit: number = 10) {
  return this.find({ 
    restaurantId, 
    rating: { $gte: 4 },
    isPublic: true,
    isModerated: false
  }).sort({ helpfulCount: -1, createdAt: -1 }).limit(limit);
};

// Static method to find negative feedback
feedbackSchema.statics.findNegative = function(restaurantId: string, limit: number = 10) {
  return this.find({ 
    restaurantId, 
    rating: { $lte: 2 },
    isPublic: true
  }).sort({ createdAt: -1 }).limit(limit);
};

// Static method to find reported feedback
feedbackSchema.statics.findReported = function(restaurantId: string) {
  return this.find({ 
    restaurantId, 
    isReported: true 
  }).sort({ reportCount: -1, createdAt: -1 });
};

// Static method to find feedback requiring moderation
feedbackSchema.statics.findRequiringModeration = function(restaurantId: string) {
  return this.find({
    restaurantId,
    $or: [
      { isReported: true },
      { isModerated: false, isPublic: false }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to get feedback statistics
feedbackSchema.statics.getStatistics = function(restaurantId: string, dateFrom: Date, dateTo: Date) {
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
        totalFeedback: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        positiveFeedback: {
          $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] }
        },
        neutralFeedback: {
          $sum: { $cond: [{ $and: [{ $gte: ['$rating', 3] }, { $lt: ['$rating', 4] }] }, 1, 0] }
        },
        negativeFeedback: {
          $sum: { $cond: [{ $lt: ['$rating', 3] }, 1, 0] }
        },
        respondedFeedback: {
          $sum: { $cond: ['$isResponded', 1, 0] }
        },
        reportedFeedback: {
          $sum: { $cond: ['$isReported', 1, 0] }
        },
        averageFoodRating: { $avg: '$categories.food' },
        averageServiceRating: { $avg: '$categories.service' },
        averageAmbianceRating: { $avg: '$categories.ambiance' },
        averageValueRating: { $avg: '$categories.value' }
      }
    }
  ]);
};

// Static method to get rating distribution
feedbackSchema.statics.getRatingDistribution = function(restaurantId: string) {
  return this.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get category ratings
feedbackSchema.statics.getCategoryRatings = function(restaurantId: string) {
  return this.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: null,
        food: { $avg: '$categories.food' },
        service: { $avg: '$categories.service' },
        ambiance: { $avg: '$categories.ambiance' },
        value: { $avg: '$categories.value' }
      }
    }
  ]);
};

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
