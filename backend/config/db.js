const dns = require('dns');
// Set public DNS resolvers to ensure reliable SRV record resolution for MongoDB Atlas on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback if environment doesn't allow setting custom DNS
}

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas cluster using connection string from process.env.MONGODB_URI
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'YOUR_OWN_ATLAS_CONNECTION_STRING' || uri.includes('YOUR_OWN_ATLAS_CONNECTION_STRING')) {
    console.error('\n======================================================================');
    console.error(' [MongoDB Atlas Error]: MONGODB_URI is not configured in backend/.env');
    console.error(' Please open backend/.env and replace YOUR_OWN_ATLAS_CONNECTION_STRING');
    console.error(' with your actual MongoDB Atlas cluster connection URI.');
    console.error(' Example: mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/cert_db');
    console.error('======================================================================\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Build indexes in development
      serverSelectionTimeoutMS: 5000, // Fast timeout if cluster unreachable
    });

    console.log('\n======================================================================');
    console.log(` MongoDB Atlas Connected Successfully!`);
    console.log(` Host: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
    console.log(' All certificate, verification, and user records will persist in Atlas.');
    console.log('======================================================================\n');
    return true;
  } catch (error) {
    console.error('\n======================================================================');
    console.error(` [MongoDB Atlas Connection Failure]: ${error.message}`);
    console.error(' Check your network connection, IP whitelist (0.0.0.0/0 in Atlas),');
    console.error(' and database username/password in backend/.env.');
    console.error('======================================================================\n');
    return false;
  }
};

module.exports = connectDB;
