import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'super_admin' | 'restaurant_owner' | 'store_admin' | 'staff';
  restaurantId?: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  permissions: string[];
  isActive: boolean;
  lastLogin: Date;
  profileImage?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['super_admin', 'restaurant_owner', 'store_admin', 'staff'],
    default: 'staff',
    required: true
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: function() {
      return this.role !== 'super_admin';
    }
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: function() {
      return this.role === 'staff';
    }
  },
  permissions: [{
    type: String,
    enum: [
      'restaurant:read', 'restaurant:write',
      'store:read', 'store:write',
      'product:read', 'product:write',
      'order:read', 'order:write',
      'customer:read', 'customer:write',
      'analytics:read', 'settings:write',
      'payment:read', 'payment:write',
      'feedback:read', 'feedback:write'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
userSchema.index({ restaurantId: 1 });
userSchema.index({ storeId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'super_admin':
        this.permissions = [
          'restaurant:read', 'restaurant:write',
          'store:read', 'store:write',
          'product:read', 'product:write',
          'order:read', 'order:write',
          'customer:read', 'customer:write',
          'analytics:read', 'settings:write',
          'payment:read', 'payment:write',
          'feedback:read', 'feedback:write'
        ];
        break;
      case 'restaurant_owner':
        this.permissions = [
          'restaurant:read', 'restaurant:write',
          'store:read', 'store:write',
          'product:read', 'product:write',
          'order:read', 'order:write',
          'customer:read', 'customer:write',
          'analytics:read', 'settings:write'
        ];
        break;
      case 'store_admin':
        this.permissions = [
          'store:read',
          'product:read',
          'order:read', 'order:write',
          'customer:read',
          'analytics:read'
        ];
        break;
      case 'staff':
        this.permissions = [
          'order:read', 'order:write',
          'product:read'
        ];
        break;
    }
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

export default mongoose.model<IUser>('User', userSchema);
