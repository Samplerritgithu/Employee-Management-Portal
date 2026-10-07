const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Employee = require('../models/Employee');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const existing = await Employee.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('Admin already exists:');
      console.log('  Email: admin@example.com');
      console.log('  Password: Admin@123');
      process.exit(0);
    }

    await Employee.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'ADMIN',
      status: 'ACTIVE',
      position: 'Administrator',
      phone: '',
      address: '',
    });

    console.log('Admin created successfully!');
    console.log('  Email: admin@example.com');
    console.log('  Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
