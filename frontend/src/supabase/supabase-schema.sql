-- SUPABASE SCHEMA (100% Free Tier - Run in Supabase SQL Editor if multi-device cloud sync is needed)

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS cafe_config (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  name TEXT NOT NULL,
  tagline TEXT,
  currency_symbol TEXT DEFAULT '$',
  tax_rate_percent NUMERIC DEFAULT 8,
  address TEXT,
  phone TEXT,
  wifi_name TEXT,
  wifi_password TEXT,
  owner_pin TEXT DEFAULT '1234',
  staff_pin TEXT DEFAULT '0000',
  tables JSONB DEFAULT '["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  image TEXT,
  is_veg BOOLEAN DEFAULT TRUE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE,
  in_stock BOOLEAN DEFAULT TRUE,
  prep_time_minutes INTEGER DEFAULT 4,
  calories INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number INTEGER NOT NULL,
  table_number TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waiter_calls (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  guests_count INTEGER DEFAULT 2,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  notes TEXT,
  table_assigned TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Real-Time Replication for instant multi-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE waiter_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE cafe_config;
