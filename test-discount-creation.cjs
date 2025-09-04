const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/restaurant_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Discount Schema (simplified)
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
  rule: {
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true }
  },
  target: {
    type: { type: String, enum: ['specific_products'], required: true },
    productIds: [mongoose.Schema.Types.ObjectId]
  },
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isRecurring: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  priority: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Discount = mongoose.model('Discount', discountSchema);

async function testDiscountCreation() {
  try {
    console.log('Testing discount creation...');
    
    // Create a test discount
    const testDiscount = new Discount({
      restaurantId: new mongoose.Types.ObjectId('68b99524ae5ef75dc50b8891'), // Use your restaurant ID
      name: {
        en: 'Test Discount',
        ar: 'خصم تجريبي',
        de: 'Test Rabatt'
      },
      description: {
        en: 'A test discount for debugging',
        ar: 'خصم تجريبي للاختبار',
        de: 'Ein Testrabatt zum Debuggen'
      },
      rule: {
        type: 'percentage',
        value: 20
      },
      target: {
        type: 'specific_products',
        productIds: [] // Empty for now, will apply to all products
      },
      schedule: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isRecurring: false
      },
      isActive: true,
      isPublic: true,
      priority: 0
    });
    
    const savedDiscount = await testDiscount.save();
    console.log('Discount created successfully:', savedDiscount);
    
    // Check if it can be retrieved
    const retrievedDiscount = await Discount.findById(savedDiscount._id);
    console.log('Retrieved discount:', retrievedDiscount);
    
    // Check active discounts
    const activeDiscounts = await Discount.find({
      restaurantId: new mongoose.Types.ObjectId('68b99524ae5ef75dc50b8891'),
      isActive: true,
      isPublic: true
    });
    console.log('Active discounts:', activeDiscounts);
    
  } catch (error) {
    console.error('Error creating discount:', error);
  } finally {
    mongoose.connection.close();
  }
}

testDiscountCreation();
