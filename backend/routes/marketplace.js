const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getListings,
  createListing,
  deleteListing,
  getMyListings,
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../utils/validation');
const { handleUpload } = require('../middleware/upload');
const { apiLimiter, createLimiter, sensitiveLimiter } = require('../middleware/rateLimit');
const MarketplaceListing = require('../models/MarketplaceListing');

// Validation rules for creating marketplace listing
const createValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 1, max: 500000 })
    .withMessage('Price must be between ₹1 and ₹5,00,000'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(MarketplaceListing.CATEGORIES)
    .withMessage(`Category must be one of: ${MarketplaceListing.CATEGORIES.join(', ')}`),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
];

// Routes
// Public: Get all active marketplace listings
router.get('/', apiLimiter, getListings);

// Private: Get user's own listings
router.get('/my', sensitiveLimiter, protect, getMyListings);

// Private: Create a new marketplace listing (with image upload)
router.post(
  '/',
  createLimiter,
  protect,
  handleUpload,
  createValidation,
  handleValidationErrors,
  createListing
);

// Private: Delete a marketplace listing (owner only)
router.delete('/:id', sensitiveLimiter, protect, deleteListing);

module.exports = router;
