# Deployment Guide

## 🚀 Quick Deployment Steps

### Option 1: Railway Deployment (Recommended)

#### Step 1: Install Railway CLI
```bash
# Using npm (requires sudo)
sudo npm install -g @railway/cli

# Or use npx (no installation needed)
npx @railway/cli --help
```

#### Step 2: Login to Railway
```bash
railway login
# This will open a browser for authentication
```

#### Step 3: Initialize Railway Project
```bash
cd /Users/hamsi/Downloads/biochar-bloom-main
railway init
```

#### Step 4: Deploy to Railway
```bash
railway up
```

#### Step 5: Configure Environment Variables
1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add these variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
NODE_ENV=production
PORT=3000
```

#### Step 6: Get Your API URL
After deployment, Railway will provide:
- **API URL**: `https://your-app-name.railway.app`
- **Health Check**: `https://your-app-name.railway.app/api/health`

### Option 2: Manual Deployment (VPS/Cloud)

#### Step 1: Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

#### Step 2: Deploy Code
```bash
# Clone repository
git clone https://github.com/ravi-teja001/sproject.git
cd sproject

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials
```

#### Step 3: Start Application
```bash
# Start with PM2
pm2 start index.js --name "biochar-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 3: Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["node", "index.js"]
```

#### Step 2: Build and Run
```bash
# Build image
docker build -t biochar-api .

# Run container
docker run -d -p 3000:3000 --env-file .env biochar-api
```

## 🔧 Frontend Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## 📋 Environment Variables Checklist

### Supabase
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_KEY` - Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (backend only)

### Railway/Backend
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `JWT_SECRET` - JWT signing secret
- [ ] `CORS_ORIGIN` - Allowed frontend origins
- [ ] `NODE_ENV` - Set to 'production'
- [ ] `PORT` - Server port (usually 3000)

### Frontend
- [ ] `VITE_API_URL` - Railway API URL
- [ ] `VITE_SUPABASE_URL` - Supabase URL
- [ ] `VITE_SUPABASE_KEY` - Supabase anon key

## 🧪 Testing Deployment

### Test Backend Health
```bash
curl https://your-app.railway.app/api/health
```

### Test Database Connection
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://your-app.railway.app/api/stock-points
```

### Test Frontend
1. Visit your frontend URL
2. Test user registration/login
3. Test data operations
4. Test file uploads

## 🔍 Troubleshooting

### Common Issues

#### 1. CORS Errors
```env
# In Railway environment variables
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com
```

#### 2. Database Connection
```bash
# Check Supabase credentials
curl https://your-project.supabase.co/rest/v1/users
```

#### 3. Build Failures
```bash
# Check package.json scripts
cat package.json | grep scripts
```

#### 4. Environment Variables
```bash
# Check Railway variables
railway variables
```

### Debug Commands

#### Railway
```bash
# View logs
railway logs

# Check status
railway status

# Redeploy
railway up
```

#### PM2 (VPS)
```bash
# View logs
pm2 logs

# Check status
pm2 status

# Restart
pm2 restart biochar-api
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

## 🔒 Security Checklist

- [ ] Environment variables are set
- [ ] JWT secret is strong
- [ ] CORS is properly configured
- [ ] Database has RLS policies
- [ ] HTTPS is enabled
- [ ] API endpoints are validated

## 🚀 Production Checklist

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Railway deployment complete
- [ ] Environment variables configured
- [ ] Frontend deployed
- [ ] API endpoints tested
- [ ] Authentication tested
- [ ] File uploads tested
- [ ] Monitoring configured

## 📞 Support

### Railway Documentation
- https://docs.railway.app/

### Supabase Documentation
- https://supabase.com/docs

### Common Issues
- Check logs for errors
- Verify environment variables
- Test database connection
- Validate API endpoints

This guide covers all deployment scenarios for your biochar management system!
