const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Department = require('../models/Department');
const connectDB = require('../config/db');

const departments = [
  { name: 'IT', description: 'Information Technology department' },
  { name: 'HR', description: 'Human Resources department' },
  { name: 'Finance', description: 'Finance and Accounting department' },
  { name: 'Marketing', description: 'Marketing and Branding department' },
  { name: 'Sales', description: 'Sales and Business Development department' },
  { name: 'Operations', description: 'Operations and Logistics department' },
];

const seedDepartments = async () => {
  try {
    await connectDB();

    for (const dept of departments) {
      const existing = await Department.findOne({ name: dept.name });
      if (!existing) {
        await Department.create(dept);
        console.log(`Created department: ${dept.name}`);
      } else {
        console.log(`Department already exists: ${dept.name}`);
      }
    }

    console.log('Departments seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDepartments();
