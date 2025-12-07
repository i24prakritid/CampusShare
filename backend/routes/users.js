const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../utils/validation');
const { sensitiveLimiter } = require('../middleware/rateLimit');

// Validation rules for updating profile
const updateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('programme')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Programme cannot be empty'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

// Routes
// Get current user profile
router.get('/me', sensitiveLimiter, protect, getProfile);

// Update current user profile
router.put('/me', sensitiveLimiter, protect, updateValidation, handleValidationErrors, updateProfile);

module.exports = router;
