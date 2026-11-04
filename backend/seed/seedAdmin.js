const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  console.log('\n--- Admin Account Seeding Script ---');

  const connected = await connectDB();
  if (!connected) {
    console.error(' Cannot seed admin without a valid MongoDB Atlas connection.');
    console.error('Please configure MONGODB_URI in backend/.env first.');
    process.exit(1);
  }

  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@certverify.edu').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(` Admin account already exists:`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role:  ${existingAdmin.role}`);
      console.log(`   ID:    ${existingAdmin.userId}`);
      console.log('You can log in to the portal using these credentials.');
    } else {
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });

      console.log('\n Default Admin Account Created Successfully:');
      console.log('----------------------------------------------------');
      console.log(` Name:     ${admin.name}`);
      console.log(` Email:    ${admin.email}`);
      console.log(` Password: ${adminPassword}`);
      console.log(` Role:     ${admin.role}`);
      console.log(` User ID:  ${admin.userId}`);
      console.log('----------------------------------------------------');
      console.log('Use this email and password to log in as Administrator.');
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(' Error seeding admin account:', error.message);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();
