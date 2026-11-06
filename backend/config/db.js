const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas cluster using connection string from process.env.MONGODB_URI
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<') || uri.includes('YOUR_OWN_ATLAS_CONNECTION_STRING')) {
    console.error('MongoDB is not configured. Set MONGODB_URI in the backend environment.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected to database "${conn.connection.name}".`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection failed (${error.name || 'connection error'}).`);
    return false;
  }
};

module.exports = connectDB;
