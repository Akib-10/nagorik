// backend/config/db.js
const mongoose = require('mongoose');

// MongoDB-তে connect হয় — timeouts দেওয়া আছে যাতে server আটকে না থাকে
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 সেকেন্ডের মধ্যে server পাওয়া না গেলে error
      connectTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // connection fail হলে process বন্ধ — main server না চলা ভালো
  }
};

module.exports = connectDB;