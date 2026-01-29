// Complete API Routes for Railway Backend
// This file contains all API endpoints for the biochar management system

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client - only if environment variables are set
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
} else {
  console.log('⚠️ Supabase environment variables not set, using mock mode');
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    
    req.user = user;
    next();
  });
};

// Helper function to handle database errors or mock mode
const handleDatabaseCall = async (callback, mockData = []) => {
  if (!supabase) {
    console.log('🧪 Mock mode: returning mock data');
    return { data: mockData, error: null };
  }
  
  try {
    return await callback();
  } catch (error) {
    console.error('Database error:', error);
    return { data: mockData, error: error.message };
  }
};

// Helper function to validate user access
const validateUserAccess = async (userId, userEmail) => {
  // For mock users, validate using email
  if (userId && userId.includes('@')) {
    return userId === userEmail;
  }
  
  // For real users, validate using UUID
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();
    
    return user && user.email === userEmail;
  } catch (error) {
    console.error('User validation error:', error);
    return false;
  }
};

// ===== AUTHENTICATION ROUTES =====

// Login endpoint
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For development, allow mock login
    if (process.env.NODE_ENV === 'development' || !supabase) {
      const token = jwt.sign(
        { email, userId: 'mock-user-id' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        data: {
          token,
          user: { email, id: 'mock-user-id' }
        }
      });
    }
    
    // Production login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: {
        token: data.session.access_token,
        user: data.user
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// Register endpoint
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: {
        user: data.user,
        message: 'Registration successful'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Verify token endpoint
router.get('/auth/verify', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase.auth.getUser(req.user.token);
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Token verification failed',
      message: error.message
    });
  }
});

// ===== STOCK POINTS ROUTES =====

router.get('/stock-points', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await handleDatabaseCall(
      () => supabase.from('stock_points').select('*').order('name'),
      [
        { id: '1', name: 'Main Stock Point', location_lat: 17.3850, location_lng: 78.4867, capacity: 1000, current_stock: 500, status: 'active' },
        { id: '2', name: 'Secondary Stock Point', location_lat: 17.4000, location_lng: 78.5000, capacity: 800, current_stock: 300, status: 'active' }
      ]
    );
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database operation failed',
      message: error.message
    });
  }
});

router.post('/stock-points', authenticateToken, async (req, res) => {
  try {
    const stockPoint = req.body;
    
    const { data, error } = await supabase
      .from('stock_points')
      .insert(stockPoint)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ===== VEHICLES ROUTES =====

router.get('/vehicles', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    let query = supabase.from('vehicles').select('*');
    
    if (userId) {
      query = query.eq('created_by', userId);
    }
    
    const { data, error } = await query.order('vehicle_number');
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.post('/vehicles', authenticateToken, async (req, res) => {
  try {
    const { userId, ...vehicleData } = req.body;
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        ...vehicleData,
        created_by: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.put('/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ...updateData } = req.body;
    
    // Verify ownership
    const { data: existing } = await supabase
      .from('vehicles')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (!existing || existing.created_by !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const { data, error } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.delete('/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    // Verify ownership
    const { data: existing } = await supabase
      .from('vehicles')
      .select('created_by')
      .eq('id', id)
      .single();
    
    if (!existing || existing.created_by !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: { id }
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ===== BIOMASS PROCUREMENT ROUTES =====

router.get('/biomass-procurement', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    let query = supabase.from('raw_biomass_procurement').select('*');
    
    if (userId) {
      query = query.eq('created_by_email', userId);
    }
    
    const { data, error } = await query.order('procurement_date', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.post('/biomass-procurement', authenticateToken, async (req, res) => {
  try {
    const procurement = req.body;
    
    // Generate procurement ID
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
    
    const sourcePrefix = procurement.source === 'cotton_stalks' ? 'COT' : 'CHL';
    const sequenceNumber = Math.floor(Math.random() * 9000 + 1000).toString().padStart(4, '0');
    const procurementId = `BMP-${sourcePrefix}-${dateStr}-${sequenceNumber}`;
    
    const { data, error } = await supabase
      .from('raw_biomass_procurement')
      .insert({
        ...procurement,
        procurement_id: procurementId,
        procurement_date: procurement.procurement_date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ===== EXPENSES ROUTES =====

router.get('/expenses', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    let query = supabase.from('expenses').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('expense_date', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.post('/expenses', authenticateToken, async (req, res) => {
  try {
    const expense = req.body;
    
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ===== PLANTS ROUTES =====

router.get('/plants', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ===== UPLOAD ROUTES =====

router.post('/upload', authenticateToken, async (req, res) => {
  try {
    // For now, return a placeholder URL
    // In production, this would handle file upload to Supabase Storage or S3
    const { type } = req.body;
    
    const mockUrl = `https://placeholder.com/uploads/${type}-${Date.now()}.jpg`;
    
    res.json({
      success: true,
      data: { url: mockUrl }
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ===== ANALYTICS ROUTES =====

router.get('/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    // Mock analytics data
    const analytics = {
      totalProcurement: 150,
      totalExpenses: 25000,
      activeVehicles: 12,
      stockPoints: 8,
      monthlyTrend: [
        { month: 'Jan', procurement: 20, expenses: 3000 },
        { month: 'Feb', procurement: 25, expenses: 3500 },
        { month: 'Mar', procurement: 30, expenses: 4000 },
      ]
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

module.exports = router;
