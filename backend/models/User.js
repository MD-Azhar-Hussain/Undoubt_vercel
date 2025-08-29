const mongoose = require('mongoose');

const userAddressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true, // e.g., 'Home', 'Office'
  },
  fullName: String,
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  phone: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: String,
  lastName: String,
  displayName: String,
  photoURL: String,
  phone: String,
  addresses: [userAddressSchema],
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better performance
userSchema.index({ firebaseId: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;