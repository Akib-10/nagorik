// One-off utility: promote (or demote) a user to admin by email.
// Usage:
//   node scripts/makeAdmin.js someone@example.com
//   node scripts/makeAdmin.js someone@example.com --remove   (to revoke admin)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/User.js';

async function main() {
  const email = process.argv[2];
  const shouldRemove = process.argv.includes('--remove');

  if (!email) {
    console.error('Usage: node scripts/makeAdmin.js <email> [--remove]');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error(`No user found with email "${email}".`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.isAdmin = !shouldRemove;
  await user.save();

  console.log(
    `${user.email} is ${user.isAdmin ? 'now an admin' : 'no longer an admin'}.`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('makeAdmin error:', err.message);
  process.exit(1);
});