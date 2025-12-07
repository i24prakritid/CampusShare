const GroupOrder = require('../models/GroupOrder');

/**
 * @desc    Get all active group orders
 * @route   GET /api/group-orders
 * @access  Public
 */
const getGroupOrders = async (req, res) => {
  try {
    const { platform, hotspot } = req.query;

    // Build filter query
    const filter = {
      isActive: true,
      expiresAt: { $gt: new Date() },
    };

    if (platform && GroupOrder.PLATFORMS.includes(platform)) {
      filter.platform = platform;
    }

    if (hotspot && GroupOrder.HOTSPOTS.includes(hotspot)) {
      filter.hotspot = hotspot;
    }

    const orders = await GroupOrder.find(filter)
      .sort({ createdAt: -1 })
      .select('-user'); // Don't expose user ObjectId

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get group orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching group orders',
    });
  }
};

/**
 * @desc    Create a new group order
 * @route   POST /api/group-orders
 * @access  Private
 */
const createGroupOrder = async (req, res) => {
  try {
    const { platform, restaurantName, balanceNeeded, hotspot, timer } = req.body;

    // Validate required fields
    if (!platform || !balanceNeeded || !hotspot || !timer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: platform, balanceNeeded, hotspot, timer',
      });
    }

    // Create order with user info from authenticated user
    const order = await GroupOrder.create({
      platform,
      restaurantName: restaurantName || undefined,
      balanceNeeded: Number(balanceNeeded),
      hotspot,
      timer: Number(timer),
      user: req.user._id,
      postedBy: req.user.name,
      phone: req.user.phone,
      programme: req.user.programme,
    });

    res.status(201).json({
      success: true,
      message: 'Group order created successfully',
      data: order.toJSON(),
    });
  } catch (error) {
    console.error('Create group order error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating group order',
    });
  }
};

/**
 * @desc    Delete/unlist a group order (owner only)
 * @route   DELETE /api/group-orders/:id
 * @access  Private (Owner only)
 */
const deleteGroupOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the order
    const order = await GroupOrder.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found',
      });
    }

    // Check ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this order',
      });
    }

    // Soft delete - mark as inactive
    order.isActive = false;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Group order unlisted successfully',
    });
  } catch (error) {
    console.error('Delete group order error:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting group order',
    });
  }
};

/**
 * @desc    Get user's own group orders
 * @route   GET /api/group-orders/my
 * @access  Private
 */
const getMyGroupOrders = async (req, res) => {
  try {
    const orders = await GroupOrder.find({
      user: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get my group orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your group orders',
    });
  }
};

module.exports = {
  getGroupOrders,
  createGroupOrder,
  deleteGroupOrder,
  getMyGroupOrders,
};
