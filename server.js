const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/connection');
const authRoutes = require('./routes/auth'); // Import Auth Routes
// const appRoutes = require('./routes/app'); // Import General Routes

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes); // Authentication Routes
// app.use('/api', appRoutes); // Other General Routes

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
