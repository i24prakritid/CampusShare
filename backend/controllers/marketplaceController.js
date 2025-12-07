const MarketplaceListing = require('../models/MarketplaceListing');
const { deleteFromCloudinary } = require('../middleware/upload');

/**
 * @desc    Get all active marketplace listings
 * @route   GET /api/marketplace
 * @access  Public
 */
const getListings = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;

    // Build filter query
    const filter = {
      isActive: true,
      expiresAt: { $gt: new Date() },
    };

    if (category && MarketplaceListing.CATEGORIES.includes(category)) {
      filter.category = category;
    }

    // Price range filters
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const listings = await MarketplaceListing.find(filter)
      .sort({ createdAt: -1 })
      .select('-user'); // Don't expose user ObjectId

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching marketplace listings',
    });
  }
};

/**
 * @desc    Create a new marketplace listing
 * @route   POST /api/marketplace
 * @access  Private
 */
const createListing = async (req, res) => {
  try {
    const { title, description, price, category, phone } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category || !phone) {
      // Delete uploaded images if validation fails
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await deleteFromCloudinary(file.public_id);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, price, category, phone',
      });
    }

    // Get image data from uploaded files (URL and public_id)
    const images = req.files
      ? req.files.map((file) => ({
          url: file.path,
          publicId: file.public_id,
        }))
      : [];

    // Create listing
    const listing = await MarketplaceListing.create({
      title,
      description,
      price: Number(price),
      category,
      phone,
      images,
      user: req.user._id,
      postedBy: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing.toJSON(),
    });
  } catch (error) {
    console.error('Create listing error:', error);

    // Delete uploaded images on error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await deleteFromCloudinary(file.public_id);
      }
    }

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
      message: 'Error creating listing',
    });
  }
};

/**
 * @desc    Delete a marketplace listing (owner only)
 * @route   DELETE /api/marketplace/:id
 * @access  Private (Owner only)
 */
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the listing
    const listing = await MarketplaceListing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check ownership
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing',
      });
    }

    // Delete images from Cloudinary using stored public_id
    if (listing.images && listing.images.length > 0) {
      for (const image of listing.images) {
        if (image.publicId) {
          await deleteFromCloudinary(image.publicId);
        }
      }
    }

    // Soft delete - mark as inactive
    listing.isActive = false;
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing removed successfully',
    });
  } catch (error) {
    console.error('Delete listing error:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting listing',
    });
  }
};

/**
 * @desc    Get user's own marketplace listings
 * @route   GET /api/marketplace/my
 * @access  Private
 */
const getMyListings = async (req, res) => {
  try {
    const listings = await MarketplaceListing.find({
      user: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your listings',
    });
  }
};

module.exports = {
  getListings,
  createListing,
  deleteListing,
  getMyListings,
};
