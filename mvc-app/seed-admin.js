require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const SUPERADMIN_EMAIL    = process.env.SUPERADMIN_EMAIL    || 'superadmin@expensetracker.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'Superadmin1234!';
const SUPERADMIN_NAME     = process.env.SUPERADMIN_NAME     || 'Super Admin';

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@expensetracker.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!';
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Admin';

async function seedRole(email, password, name, role) {
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== role) {
      existing.role = role;
      await existing.save();
      console.log(`Promoted existing user "${email}" to ${role}.`);
    } else {
      console.log(`${role} "${email}" already exists — nothing to do.`);
    }
  } else {
    await User.create({ name, email, password, role });
    console.log(`${role} account created: ${email} / ${password}`);
  }
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await seedRole(SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME, 'superadmin');
  await seedRole(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, 'admin');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
