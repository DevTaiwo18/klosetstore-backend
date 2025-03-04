// filepath: /c:/Users/User/Desktop/WebDev/klosetstore-backend/server.js
const express = require('express');
const cors = require('cors');
 require('dotenv').config();
 const connectDB = require('./db/connection');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});