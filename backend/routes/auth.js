const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../utils/validation');
const { authLimiter, sensitiveLimiter } = require('../middleware/rateLimit');

// Validation rules for signup
const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('programme')
    .trim()
    .notEmpty()
    .withMessage('Programme is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Validation rules for login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Routes
router.post('/signup', authLimiter, signupValidation, handleValidationErrors, signup);
router.post('/login', authLimiter, loginValidation, handleValidationErrors, login);
router.get('/me', sensitiveLimiter, protect, getMe);
router.post('/logout', sensitiveLimiter, protect, logout);

module.exports = router;
