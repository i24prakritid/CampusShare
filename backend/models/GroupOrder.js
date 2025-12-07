const mongoose = require('mongoose');

const PLATFORMS = ['Zomato', 'Swiggy', 'Blinkit', 'BigBasket', 'Dominos', 'NightMess', 'EatSure'];
const HOTSPOTS = [
  'Academic Block',
  'Learning Resource Centre (LRC/Library)',
  'New Academic Block',
  'Student Mess (Dining Hall)',
  'Sports Complex',
  'Gymnasium',
  'Swimming Pool',
  'Football Ground',
  'Cricket Ground',
  'Basketball Court',
  'Tennis Court',
  'Student Activity Centre (SAC)',
  'Open Air Theatre (OAT)',
  'Hostel A (Narmada Residence)',
  'Hostel B (Ganga Residence)',
  'Hostel C (Yamuna Residence)',
  'Hostel D (Godavari Residence)',
  'Hostel E (Kaveri Residence)',
  'Married Students Hostel (MSH)',
  'Faculty Residence',
  'Admin Block',
  'Main Gate',
  'Hilltop (View Point)',
  'Amul Parlour',
  'Night Canteen',
  'Coffee Shack',
  'Finance Lab',
  'Bloomberg Terminal Room',
];

// Platforms that require restaurant name
const NEEDS_RESTAURANT = ['Zomato', 'Swiggy'];

const groupOrderSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: PLATFORMS,
        message: 'Invalid platform. Must be one of: ' + PLATFORMS.join(', '),
      },
    },
    restaurantName: {
      type: String,
      trim: true,
      maxlength: [100, 'Restaurant name cannot exceed 100 characters'],
      validate: {
        validator: function (value) {
          // Restaurant name is required for Zomato and Swiggy
          if (NEEDS_RESTAURANT.includes(this.platform)) {
            return value && value.trim().length > 0;
          }
          return true;
        },
        message: 'Restaurant name is required for Zomato and Swiggy orders',
      },
    },
    balanceNeeded: {
      type: Number,
      required: [true, 'Balance needed is required'],
      min: [1, 'Balance needed must be at least ₹1'],
      max: [10000, 'Balance needed cannot exceed ₹10,000'],
    },
    hotspot: {
      type: String,
      required: [true, 'Hotspot is required'],
      enum: {
        values: HOTSPOTS,
        message: 'Invalid hotspot. Must be one of: ' + HOTSPOTS.join(', '),
      },
    },
    timer: {
      type: Number,
      required: [true, 'Timer duration is required'],
      enum: {
        values: [15, 30, 45, 60],
        message: 'Timer must be 15, 30, 45, or 60 minutes',
      },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - document deleted when expiresAt is reached
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postedBy: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    programme: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient queries
groupOrderSchema.index({ isActive: 1, expiresAt: 1 });
groupOrderSchema.index({ platform: 1, isActive: 1 });
groupOrderSchema.index({ hotspot: 1, isActive: 1 });
groupOrderSchema.index({ user: 1, isActive: 1 });

// Static method to get active orders
groupOrderSchema.statics.getActiveOrders = function () {
  return this.find({
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

// Pre-save middleware to set expiresAt based on timer
groupOrderSchema.pre('validate', function (next) {
  if (this.isNew && this.timer && ! this.expiresAt) {
    this.expiresAt = new Date(Date.now() + this.timer * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('GroupOrder', groupOrderSchema);
module.exports.PLATFORMS = PLATFORMS;
module.exports.HOTSPOTS = HOTSPOTS;
module.exports.NEEDS_RESTAURANT = NEEDS_RESTAURANT;
