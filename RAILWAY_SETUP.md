# Railway Setup Guide

## 1. Prepare Backend for Railway
Your backend should be ready for deployment. Key requirements:

### Package.json Scripts
```json
{
  "scripts": {
    "start": "node index.js",
    "build": "echo 'No build step needed'",
    "dev": "nodemon index.js"
  }
}
```

### Railway Environment Variables
Create a `railway.toml` file:

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
name = "api"

[services.variables]
NODE_ENV = "production"
PORT = "3000"
```

## 2. Deploy to Railway

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Initialize Railway Project
```bash
cd /Users/hamsi/Downloads/biochar-bloom-main
railway init
```

### Step 4: Deploy
```bash
railway up
```

## 3. Configure Railway Environment Variables
After deployment, set these in Railway dashboard:

1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Add these variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com

# Database (if using Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Node Environment
NODE_ENV=production
PORT=3000
```

## 4. Railway API Endpoints
Once deployed, Railway will provide:
- **API URL**: `https://your-app-name.railway.app`
- **Health Check**: `https://your-app-name.railway.app/api/health`

## 5. Update Frontend API Configuration
Update your frontend to use Railway API:

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-app-name.railway.app';

export const api = {
  // All your API endpoints will use this base URL
  get: (endpoint: string) => fetch(`${API_BASE_URL}${endpoint}`),
  post: (endpoint: string, data: any) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  // ... other methods
};
```

## 6. Frontend Environment Variables
Add to `.env.local`:

```env
VITE_API_URL=https://your-app-name.railway.app
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_KEY=your_supabase_anon_key_here
```

## 7. Test Complete Flow
1. Frontend calls Railway API
2. Railway API processes business logic
3. Railway API interacts with Supabase
4. Data flows back through Railway to Frontend

## 8. Railway Features
- **Auto-deploy**: Git integration for automatic deployments
- **Logs**: View application logs in Railway dashboard
- **Metrics**: Monitor performance and usage
- **Environment**: Easy environment variable management
- **Scaling**: Scale up/down as needed
