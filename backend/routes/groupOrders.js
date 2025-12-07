const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getGroupOrders,
  createGroupOrder,
  deleteGroupOrder,
  getMyGroupOrders,
} = require('../controllers/groupOrderController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../utils/validation');
const { apiLimiter, createLimiter, sensitiveLimiter } = require('../middleware/rateLimit');
const GroupOrder = require('../models/GroupOrder');

// Validation rules for creating group order
const createValidation = [
  body('platform')
    .trim()
    .notEmpty()
    .withMessage('Platform is required')
    .isIn(GroupOrder.PLATFORMS)
    .withMessage(`Platform must be one of: ${GroupOrder.PLATFORMS.join(', ')}`),
  body('restaurantName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Restaurant name cannot exceed 100 characters'),
  body('balanceNeeded')
    .notEmpty()
    .withMessage('Balance needed is required')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Balance needed must be between ₹1 and ₹10,000'),
  body('hotspot')
    .trim()
    .notEmpty()
    .withMessage('Hotspot is required')
    .isIn(GroupOrder.HOTSPOTS)
    .withMessage(`Hotspot must be one of: ${GroupOrder.HOTSPOTS.join(', ')}`),
  body('timer')
    .notEmpty()
    .withMessage('Timer is required')
    .isIn([15, 30, 45, 60])
    .withMessage('Timer must be 15, 30, 45, or 60 minutes'),
];

// Routes
// Public: Get all active group orders
router.get('/', apiLimiter, getGroupOrders);

// Private: Get user's own group orders
router.get('/my', sensitiveLimiter, protect, getMyGroupOrders);

// Private: Create a new group order
router.post('/', createLimiter, protect, createValidation, handleValidationErrors, createGroupOrder);

// Private: Delete/unlist a group order (owner only)
router.delete('/:id', sensitiveLimiter, protect, deleteGroupOrder);

module.exports = router;
