const express = require('express');
const router = express.Router();

// Health check for API
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'API routes working' });
});

// Mock login endpoint
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const jwt = require('jsonwebtoken');
  
  const token = jwt.sign(
    { email, userId: 'mock-user-id' },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
  
  res.json({
    success: true,
    data: {
      token,
      user: { email, id: 'mock-user-id' }
    }
  });
});

// Mock stock points
router.get('/stock-points', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', name: 'Main Stock Point', location_lat: 17.3850, location_lng: 78.4867, capacity: 1000, current_stock: 500, status: 'active' },
      { id: '2', name: 'Secondary Stock Point', location_lat: 17.4000, location_lng: 78.5000, capacity: 800, current_stock: 300, status: 'active' }
    ]
  });
});

module.exports = router;
