const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Configuration constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max file size
const MAX_FILES = 3;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Middleware for uploading up to 3 images
const uploadImages = upload.array('images', MAX_FILES);

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusshare/marketplace',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Error handling wrapper for multer and Cloudinary upload
const handleUpload = (req, res, next) => {
  uploadImages(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Cannot upload more than 3 images',
        });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size cannot exceed 5MB',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading images',
      });
    }

    // If files were uploaded, upload them to Cloudinary
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.buffer, file.mimetype)
        );
        const results = await Promise.all(uploadPromises);
        // Replace multer file info with Cloudinary URLs
        req.files = results.map((result) => ({
          path: result.secure_url,
          public_id: result.public_id,
        }));
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading images to cloud storage',
        });
      }
    }

    next();
  });
};

// Delete image from Cloudinary using public_id
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.warn('No public_id provided for Cloudinary deletion');
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

module.exports = {
  handleUpload,
  deleteFromCloudinary,
};
