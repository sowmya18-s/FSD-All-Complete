const mongoose = require('mongoose');

/**
 * Middleware to verify that MongoDB Atlas is connected before executing database operations.
 * Prevents 10-second query buffering timeouts when MONGODB_URI has not been configured in .env.
 */
const checkDBConnection = (req, res, next) => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'The database is currently unavailable. Please try again later.',
    });
  }

  next();
};

module.exports = checkDBConnection;
