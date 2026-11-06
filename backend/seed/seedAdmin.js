const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before seeding.');
  }
  if (Buffer.byteLength(ADMIN_PASSWORD, 'utf8') < 8 || Buffer.byteLength(ADMIN_PASSWORD, 'utf8') > 72) {
    throw new Error('ADMIN_PASSWORD must be between 8 and 72 UTF-8 bytes.');
  }

  const connected = await connectDB();
  if (!connected) {
    throw new Error('Unable to connect to the configured MongoDB database.');
  }

  try {
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role !== 'admin') {
        throw new Error('The configured admin email belongs to a non-admin account.');
      }
      console.log(`Administrator already exists (${existing.email}, ${existing.userId}).`);
      return;
    }

    const admin = await User.create({
      name: ADMIN_NAME.trim(),
      email,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Administrator created (${admin.email}, ${admin.userId}).`);
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin().catch((error) => {
  console.error('Admin seeding failed. Verify the required environment variables and database connection.');
  process.exitCode = 1;
});
