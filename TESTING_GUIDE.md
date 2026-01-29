# Testing Guide for Complete Architecture

## 🧪 Architecture Testing Checklist

### Test Environment Setup
- [ ] Supabase project created and configured
- [ ] Railway backend deployed
- [ ] Frontend environment variables set
- [ ] All services running

## 🔍 Step-by-Step Testing

### 1. Test Supabase Connection

#### Database Connection Test
```bash
# Test direct Supabase connection
curl -H "apikey: YOUR_SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     https://your-project.supabase.co/rest/v1/users
```

#### Authentication Test
```javascript
// In browser console
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Test sign up
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
});

console.log('Sign up test:', { data, error });
```

### 2. Test Railway Backend

#### Health Check Test
```bash
# Test backend health
curl https://your-app.railway.app/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-29T05:30:00.000Z",
  "uptime": 123.45,
  "memory": {...},
  "version": "2.0.0"
}
```

#### API Endpoints Test
```bash
# Test authentication
curl -X POST https://your-app.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpassword123"}'

# Test protected endpoint (with token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://your-app.railway.app/api/stock-points
```

### 3. Test Frontend Integration

#### Environment Variables Test
```javascript
// In browser console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_KEY?.substring(0, 10) + '...');
```

#### API Service Test
```javascript
// Test Railway API service
import { healthCheck, stockPointsApi } from './src/services/railway-api.js';

// Test health check
const health = await healthCheck();
console.log('Health check:', health);

// Test stock points
const stockPoints = await stockPointsApi.getAll();
console.log('Stock points:', stockPoints);
```

## 🔄 Complete Flow Testing

### Test 1: User Registration Flow
1. **Frontend**: User fills registration form
2. **Frontend**: Calls Supabase Auth API
3. **Supabase**: Creates user account
4. **Supabase**: Returns JWT token
5. **Frontend**: Stores token
6. **Frontend**: Redirects to dashboard

```javascript
// Test registration flow
const testRegistration = async () => {
  try {
    // 1. Register user
    const { data, error } = await supabase.auth.signUp({
      email: 'testuser@example.com',
      password: 'testpassword123',
      options: {
        data: { full_name: 'Test User' }
      }
    });
    
    if (error) throw error;
    
    // 2. Get session
    const session = data.session;
    console.log('Registration successful:', session);
    
    // 3. Test API call with token
    const response = await fetch('https://your-app.railway.app/api/stock-points', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    
    const result = await response.json();
    console.log('API test result:', result);
    
  } catch (error) {
    console.error('Registration test failed:', error);
  }
};
```

### Test 2: Data Creation Flow
1. **Frontend**: User fills vehicle form
2. **Frontend**: Calls Railway API with JWT
3. **Railway**: Validates JWT with Supabase
4. **Railway**: Saves data to Supabase
5. **Supabase**: Stores vehicle record
6. **Railway**: Returns success response
7. **Frontend**: Updates UI

```javascript
// Test vehicle creation
const testVehicleCreation = async () => {
  try {
    const vehicleData = {
      vehicleNumber: 'TS-08-AB-1234',
      weight: 1500,
      type: 'tractor',
      name: 'Test Tractor',
      district: 'Hyderabad',
      state: 'Telangana'
    };
    
    const response = await fetch('https://your-app.railway.app/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        ...vehicleData,
        userId: 'test-user-id'
      })
    });
    
    const result = await response.json();
    console.log('Vehicle creation result:', result);
    
    // Verify in database
    const { data: verification } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vehicle_number', vehicleData.vehicleNumber)
      .single();
    
    console.log('Database verification:', verification);
    
  } catch (error) {
    console.error('Vehicle creation test failed:', error);
  }
};
```

### Test 3: File Upload Flow
1. **Frontend**: User selects image
2. **Frontend**: Uploads to Supabase Storage
3. **Supabase**: Stores file, returns URL
4. **Frontend**: Creates record with file URL
5. **Frontend**: Calls Railway API
6. **Railway**: Saves record with file URL

```javascript
// Test file upload
const testFileUpload = async () => {
  try {
    // 1. Upload file to Supabase Storage
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(`test-${Date.now()}.jpg`, file);
    
    if (uploadError) throw uploadError;
    
    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(uploadData.path);
    
    console.log('File uploaded:', publicUrl);
    
    // 3. Create expense record with file URL
    const expenseData = {
      category: 'Fuel',
      amount: 1500,
      description: 'Test expense with receipt',
      expense_date: new Date().toISOString().split('T')[0],
      receipt_url: publicUrl,
      user_id: 'test-user-id'
    };
    
    const response = await fetch('https://your-app.railway.app/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(expenseData)
    });
    
    const result = await response.json();
    console.log('Expense with file:', result);
    
  } catch (error) {
    console.error('File upload test failed:', error);
  }
};
```

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors
**Symptoms**: Browser shows CORS policy errors
**Solution**:
```env
# In Railway environment variables
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
```

### Issue 2: JWT Token Errors
**Symptoms**: 401 Unauthorized errors
**Solution**:
```javascript
// Check token format
const token = localStorage.getItem('supabase_token');
console.log('Token exists:', !!token);
console.log('Token format:', token?.substring(0, 20) + '...');
```

### Issue 3: Database Connection Errors
**Symptoms**: 500 Internal Server Error
**Solution**:
```bash
# Check Supabase credentials
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
curl https://your-project.supabase.co/rest/v1/users
```

### Issue 4: Environment Variables Missing
**Symptoms**: undefined values in frontend
**Solution**:
```javascript
// Check environment variables
console.log('Environment variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_SUPABASE_KEY: import.meta.env.VITE_SUPABASE_KEY
});
```

## 📊 Performance Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create test config (artillery-config.yml)
# Run load test
artillery run artillery-config.yml
```

### API Response Time Testing
```javascript
// Test API response times
const testApiPerformance = async () => {
  const start = performance.now();
  
  const response = await fetch('https://your-app.railway.app/api/health');
  const data = await response.json();
  
  const end = performance.now();
  console.log(`API response time: ${end - start}ms`);
  console.log('Response data:', data);
};
```

## 🔧 Debug Tools

### Browser DevTools
1. **Network Tab**: Monitor API calls
2. **Console**: Check for errors
3. **Application Tab**: Inspect localStorage

### Railway Logs
```bash
# View Railway logs
railway logs

# Follow logs in real-time
railway logs --follow
```

### Supabase Dashboard
1. **Database**: Check table contents
2. **Authentication**: View user sessions
3. **Storage**: Inspect uploaded files

## ✅ Success Criteria

### Basic Functionality
- [ ] User can register/login
- [ ] Frontend loads data from API
- [ ] Data persists in database
- [ ] File uploads work correctly

### Performance
- [ ] API response time < 2 seconds
- [ ] Page load time < 5 seconds
- [ ] No memory leaks in frontend

### Security
- [ ] JWT tokens are validated
- [ ] CORS policies are enforced
- [ ] Environment variables are secure

### Reliability
- [ ] Error handling works correctly
- [ ] Database connections are stable
- [ ] File uploads complete successfully

Run this complete testing suite to ensure your architecture works end-to-end!
