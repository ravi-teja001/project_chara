# Supabase Setup Guide

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Choose organization
6. Set project name: `biochar-management`
7. Set database password (save it securely)
8. Choose region closest to you
9. Click "Create new project"

## 2. Get Supabase Credentials
Once project is created:
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (https://xxx.supabase.co)
   - **anon public** key
   - **service_role** key (for backend only)

## 3. Set up Database Tables
Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Biomass procurement table
CREATE TABLE biomass_procurement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  supplier_name VARCHAR(255) NOT NULL,
  biomass_type VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  procurement_date DATE NOT NULL,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock points table
CREATE TABLE stock_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  location_lat DECIMAL(10,8) NOT NULL,
  location_lng DECIMAL(11,8) NOT NULL,
  capacity DECIMAL(10,2),
  current_stock DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Set up Authentication
1. Go to Authentication → Settings
2. Configure site URL: `http://localhost:5173` (development)
3. Configure redirect URLs: `http://localhost:5173/*`
4. Enable email authentication

## 5. Set up Storage
1. Go to Storage
2. Create new bucket: `receipts`
3. Make it public
4. Set up CORS policy if needed

## 6. Update Environment Variables
Create `.env.local` file in your project:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_KEY=your_supabase_anon_key_here
```

## 7. Test Connection
Run your app and verify:
- Users can sign up/login
- Data appears in database
- File uploads work to storage
