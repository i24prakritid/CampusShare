const https = require('https');

/**
 * Verify Google reCAPTCHA v3 token
 * @param {string} token - reCAPTCHA token from frontend
 * @param {string} action - Expected action name (e.g., 'signup', 'login')
 * @returns {Promise<{success: boolean, score?: number, action?: string, message?: string}>}
 */
const verifyRecaptcha = async (token, expectedAction = null) => {
  // Skip verification if secret key not configured (development mode)
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.warn('reCAPTCHA secret key not configured. Skipping verification.');
    return { success: true, score: 1.0, message: 'Verification skipped (no secret key)' };
  }

  if (!token) {
    return { success: false, message: 'reCAPTCHA token is required' };
  }

  return new Promise((resolve) => {
    const postData = `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(token)}`;

    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (!response.success) {
            return resolve({
              success: false,
              message: 'reCAPTCHA verification failed',
              errorCodes: response['error-codes'],
            });
          }

          // Check score (0.0 - 1.0, higher is more likely human)
          // Default threshold of 0.5 is recommended, configurable via environment variable
          const scoreThreshold = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD) || 0.5;
          if (response.score < scoreThreshold) {
            return resolve({
              success: false,
              score: response.score,
              message: 'Low reCAPTCHA score. Please try again.',
            });
          }

          // Check action if expected
          if (expectedAction && response.action !== expectedAction) {
            return resolve({
              success: false,
              message: 'reCAPTCHA action mismatch',
            });
          }

          resolve({
            success: true,
            score: response.score,
            action: response.action,
          });
        } catch (error) {
          resolve({
            success: false,
            message: 'Error parsing reCAPTCHA response',
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('reCAPTCHA verification error:', error);
      resolve({
        success: false,
        message: 'reCAPTCHA verification request failed',
      });
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Middleware to verify reCAPTCHA
 * @param {string} action - Expected action name
 */
const recaptchaMiddleware = (action) => {
  return async (req, res, next) => {
    const { recaptchaToken } = req.body;

    const result = await verifyRecaptcha(recaptchaToken, action);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'reCAPTCHA verification failed',
      });
    }

    // Attach score to request for logging/monitoring
    req.recaptchaScore = result.score;
    next();
  };
};

module.exports = {
  verifyRecaptcha,
  recaptchaMiddleware,
};
