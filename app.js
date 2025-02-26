const express = require('express');
const router = express.Router();

// Test Route
router.get('/', (req, res) => {
    res.json({ message: 'Backend is running...' });
});

// Example Route
router.get('/hello', (req, res) => {
    res.json({ message: "Hello from API!" });
});

// Export Router
module.exports = router;
