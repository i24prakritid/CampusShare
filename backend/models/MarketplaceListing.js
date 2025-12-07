const mongoose = require('mongoose');

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Cycles', 'Sports', 'Others'];

// 7 days in milliseconds
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const marketplaceListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least ₹1'],
      max: [500000, 'Price cannot exceed ₹5,00,000'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Invalid category. Must be one of: ' + CATEGORIES.join(', '),
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      validate: {
        validator: function (v) {
          return v.length <= 3;
        },
        message: 'Cannot upload more than 3 images',
      },
      default: [],
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

// Compound indexes for efficient queries
marketplaceListingSchema.index({ isActive: 1, expiresAt: 1 });
marketplaceListingSchema.index({ category: 1, isActive: 1 });
marketplaceListingSchema.index({ user: 1, isActive: 1 });
marketplaceListingSchema.index({ price: 1, isActive: 1 });

// Static method to get active listings
marketplaceListingSchema.statics.getActiveListings = function () {
  return this.find({
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

// Pre-save middleware to set expiresAt to 7 days from now
marketplaceListingSchema.pre('validate', function (next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);
  }
  next();
});

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
module.exports.CATEGORIES = CATEGORIES;
