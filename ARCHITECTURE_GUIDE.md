# Complete Architecture Setup Guide

## 🏗️ Architecture Overview

```
Frontend / App (React + TypeScript)
      ↓
Railway (Backend API / Server)
      ↓
Supabase (Database + Auth + Storage)
```

## 📋 Setup Steps

### Step 1: Supabase Setup (Database + Auth + Storage)
1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project: `biochar-management`
   - Save database password securely

2. **Get Credentials**
   - Project Settings → API
   - Copy Project URL and anon key

3. **Set up Database Tables**
   - Run SQL from `SUPABASE_SETUP.md`
   - Create tables: users, biomass_procurement, expenses, stock_points

4. **Configure Authentication**
   - Enable email auth
   - Set site URL: `http://localhost:5173`
   - Configure redirect URLs

5. **Set up Storage**
   - Create bucket: `receipts`
   - Configure CORS if needed

### Step 2: Railway Setup (Backend API Server)
1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend**
   ```bash
   cd /Users/hamsi/Downloads/biochar-bloom-main
   railway init
   railway up
   ```

3. **Configure Environment Variables**
   - Go to Railway dashboard
   - Add Supabase credentials
   - Set JWT secret
   - Configure CORS

4. **Get API URL**
   - Railway provides: `https://your-app.railway.app`

### Step 3: Frontend Configuration
1. **Update Environment Variables**
   ```env
   # .env.local
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_anon_key
   VITE_API_URL=https://your-app.railway.app
   ```

2. **Update API Service**
   - Modify `src/services/api.ts` to use Railway URL
   - Ensure all API calls route through Railway

## 🔧 Configuration Files

### Railway Configuration (`railway.toml`)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node index.js"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "biochar-api"

[services.variables]
NODE_ENV = "production"
PORT = "3000"
```

### Environment Variables
```env
# Railway Environment Variables
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
NODE_ENV=production
PORT=3000

# Frontend Environment Variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_API_URL=https://your-app.railway.app
```

## 🔄 Data Flow

### Authentication Flow
1. User logs in via Supabase Auth
2. Frontend receives JWT token
3. Frontend includes token in API calls
4. Railway validates token with Supabase
5. Railway processes request

### API Flow
1. Frontend calls `https://your-app.railway.app/api/endpoint`
2. Railway receives request
3. Railway validates JWT token
4. Railway processes business logic
5. Railway interacts with Supabase
6. Data flows back through Railway to Frontend

### File Upload Flow
1. Frontend uploads file to Supabase Storage
2. Frontend gets file URL
3. Frontend sends file URL to Railway
4. Railway stores URL in database

## 🚀 Deployment Commands

### Supabase
```bash
# No deployment needed - managed service
```

### Railway
```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# View logs
railway logs

# View status
railway status
```

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

## 🧪 Testing the Architecture

### 1. Test Supabase Connection
```bash
# Test database connection
curl https://your-project.supabase.co/rest/v1/users
```

### 2. Test Railway API
```bash
# Test health endpoint
curl https://your-app.railway.app/api/health
```

### 3. Test Complete Flow
1. Start frontend: `npm run dev`
2. Test user registration/login
3. Test data creation/retrieval
4. Test file uploads

## 🔍 Troubleshooting

### Common Issues
1. **CORS Errors**: Update CORS origins in Railway
2. **Auth Errors**: Check JWT configuration
3. **Database Errors**: Verify Supabase credentials
4. **Build Errors**: Check package.json scripts

### Debug Commands
```bash
# Check Railway logs
railway logs

# Check environment variables
railway variables

# Check deployment status
railway status
```

## 📊 Monitoring

### Railway Dashboard
- Application logs
- Performance metrics
- Error tracking
- Resource usage

### Supabase Dashboard
- Database performance
- Authentication logs
- Storage usage
- API metrics

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **JWT Tokens**: Use short expiration times
3. **CORS**: Restrict to specific domains
4. **Database**: Use Row Level Security (RLS)
5. **API**: Validate all inputs

## 📈 Scaling

### Railway Scaling
- Automatic scaling based on load
- Custom scaling configurations
- Load balancing

### Supabase Scaling
- Auto-scaling database
- CDN for storage
- Global edge network

This architecture provides a robust, scalable solution for your biochar management system!
