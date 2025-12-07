/**
 * CSRF Protection Middleware
 * 
 * This middleware provides CSRF protection by:
 * 1. Checking the Origin header against allowed origins
 * 2. Verifying the Referer header as a fallback
 * 3. Working with SameSite cookies for comprehensive protection
 */

const csrfProtection = (req, res, next) => {
  // Skip CSRF check for safe HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Check Origin header first (more reliable)
  if (origin) {
    if (origin === allowedOrigin) {
      return next();
    }
    console.warn(`CSRF blocked: Origin mismatch. Expected: ${allowedOrigin}, Got: ${origin}`);
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed: invalid origin',
    });
  }

  // Fallback to Referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const allowedUrl = new URL(allowedOrigin);
      
      if (refererUrl.origin === allowedUrl.origin) {
        return next();
      }
    } catch (error) {
      // Invalid URL in referer, proceed with caution
      console.warn('CSRF: Invalid referer URL:', referer);
    }
  }

  // In development, allow requests without origin/referer for testing tools like Postman
  if (process.env.NODE_ENV === 'development') {
    console.warn('CSRF: Allowing request without origin/referer in development mode');
    return next();
  }

  // Block the request
  console.warn('CSRF blocked: No valid origin or referer');
  return res.status(403).json({
    success: false,
    message: 'CSRF validation failed: missing origin header',
  });
};

module.exports = csrfProtection;
