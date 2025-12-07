const { validationResult } = require('express-validator');

/**
 * Validation error handler middleware
 * Must be used after express-validator check middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
};

/**
 * Sanitize phone number - keep only digits
 */
const sanitizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

/**
 * Validate phone number format (10 digits)
 */
const isValidPhone = (phone) => {
  const sanitized = sanitizePhone(phone);
  return /^[0-9]{10}$/.test(sanitized);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

/**
 * Sanitize string - trim and remove extra whitespace
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
};

module.exports = {
  handleValidationErrors,
  sanitizePhone,
  isValidPhone,
  isValidEmail,
  sanitizeString,
};
