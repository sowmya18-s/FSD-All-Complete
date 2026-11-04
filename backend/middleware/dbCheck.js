const mongoose = require('mongoose');

/**
 * Middleware to verify that MongoDB Atlas is connected before executing database operations.
 * Prevents 10-second query buffering timeouts when MONGODB_URI has not been configured in .env.
 */
const checkDBConnection = (req, res, next) => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    const uri = process.env.MONGODB_URI;
    const isPlaceholder =
      !uri ||
      uri === 'YOUR_OWN_ATLAS_CONNECTION_STRING' ||
      uri.includes('YOUR_OWN_ATLAS_CONNECTION_STRING');

    if (isPlaceholder) {
      return res.status(503).json({
        success: false,
        message:
          'Database Connection Required: Please open backend/.env and replace "YOUR_OWN_ATLAS_CONNECTION_STRING" with your actual MongoDB Atlas cluster connection string.',
      });
    }

    return res.status(503).json({
      success: false,
      message:
        'MongoDB Atlas is currently connecting or unreachable. Please verify your internet connection and ensure your IP address is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access.',
    });
  }

  next();
};

module.exports = checkDBConnection;
