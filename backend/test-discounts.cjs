// Test script to add discounts directly to database
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/restaurant', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Discount Schema
const discountSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant'
  },
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    de: { type: String, required: true }
  },
  description: {
    en: { type: String, default: '' },
    ar: { type: String, default: '' },
    de: { type: String, default: '' }
  },
  code: String,
  rule: {
    type: { type: String, enum: ['percentage', 'fixed', 'buy_x_get_y', 'free_shipping'], required: true },
    value: { type: Number, required: true },
    minimumOrder: Number,
    maximumDiscount: Number
  },
  target: {
    type: { type: String, enum: ['all_products', 'specific_products', 'specific_categories', 'specific_customers'], required: true },
    productIds: [mongoose.Schema.Types.ObjectId],
    categoryIds: [mongoose.Schema.Types.ObjectId],
    customerIds: [mongoose.Schema.Types.ObjectId],
    customerGroups: [String]
  },
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isRecurring: { type: Boolean, default: false }
  },
  image: String,
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  usageLimit: Number,
  usageCount: { type: Number, default: 0 },
  customerUsageLimit: Number,
  customerUsage: [{
    customerId: mongoose.Schema.Types.ObjectId,
    usageCount: { type: Number, default: 0 },
    lastUsedAt: Date
  }],
  priority: { type: Number, default: 0 },
  conditions: {
    minimumOrderAmount: Number,
    maximumOrderAmount: Number,
    customerType: [String],
    excludedProducts: [mongoose.Schema.Types.ObjectId],
    excludedCategories: [mongoose.Schema.Types.ObjectId]
  },
  usageHistory: [{
    customerId: mongoose.Schema.Types.ObjectId,
    orderId: mongoose.Schema.Types.ObjectId,
    discountAmount: Number,
    usedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const Discount = mongoose.model('Discount', discountSchema);

const sampleDiscounts = [
  {
    restaurantId: '68a46a003f923c33fd567ac0',
    name: {
      en: 'Summer Discount',
      ar: 'خصم الصيف',
      de: 'Sommerrabatt'
    },
    description: {
      en: 'Get 15% off on all summer items',
      ar: 'احصل على خصم 15% على جميع منتجات الصيف',
      de: 'Erhalten Sie 15% Rabatt auf alle Sommerartikel'
    },
    code: 'SUMMER15',
    rule: {
      type: 'percentage',
      value: 15,
      minimumOrder: 50
    },
    target: {
      type: 'all_products'
    },
    schedule: {
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      isRecurring: false
    },
    isActive: true,
    isPublic: true,
    usageLimit: 1000,
    usageCount: 0,
    customerUsageLimit: 1,
    customerUsage: [],
    priority: 1,
    conditions: {
      minimumOrderAmount: 50
    },
    usageHistory: []
  },
  {
    restaurantId: '68a46a003f923c33fd567ac0',
    name: {
      en: 'Fixed Discount on Salads',
      ar: 'خصم ثابت على السلطات',
      de: 'Fester Rabatt auf Salate'
    },
    description: {
      en: 'Get 5 SAR off on all salads',
      ar: 'احصل على خصم 5 ريال على جميع السلطات',
      de: 'Erhalten Sie 5 SAR Rabatt auf alle Salate'
    },
    code: 'SALAD5',
    rule: {
      type: 'fixed',
      value: 5
    },
    target: {
      type: 'specific_categories',
      categoryIds: []
    },
    schedule: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isRecurring: false
    },
    isActive: true,
    isPublic: true,
    usageLimit: 500,
    usageCount: 0,
    customerUsageLimit: 2,
    customerUsage: [],
    priority: 2,
    conditions: {},
    usageHistory: []
  }
];

async function addSampleDiscounts() {
  try {
    console.log('🚀 Adding sample discounts...');
    
    // Clear existing sample discounts
    await Discount.deleteMany({ 
      restaurantId: '68a46a003f923c33fd567ac0',
      code: { $in: ['SUMMER15', 'SALAD5'] }
    });

    // Create new sample discounts
    const createdDiscounts = await Discount.insertMany(sampleDiscounts);
    
    console.log('✅ Sample discounts created successfully:');
    createdDiscounts.forEach(discount => {
      console.log(`- ${discount.name.en} (${discount.code})`);
    });
    
    // Check active discounts
    const activeDiscounts = await Discount.find({ 
      restaurantId: '68a46a003f923c33fd567ac0',
      isActive: true,
      isPublic: true
    });
    
    console.log('\n📊 Active discounts:', activeDiscounts.length);
    activeDiscounts.forEach(discount => {
      console.log(`- ${discount.name.en} (${discount.code}) - ${discount.rule.type} ${discount.rule.value}${discount.rule.type === 'percentage' ? '%' : ' SAR'}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating sample discounts:', error);
  } finally {
    mongoose.connection.close();
  }
}

addSampleDiscounts();
