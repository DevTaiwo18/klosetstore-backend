// filepath: /c:/Users/User/Desktop/WebDev/klosetstore-backend/db/connection.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI.replace('<db_password>', process.env.MONGODB_PASSWORD);
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully 😊');
  } catch (err) {
    console.error('MongoDB connection error 😞:', err);
    process.exit(1);
  }
};

module.exports = connectDB;