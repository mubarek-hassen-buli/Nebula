# Database Schema

## Overview

Nebula Delivery uses Supabase (PostgreSQL) with Row Level Security (RLS) for data protection.

---

## Tables

### 1. Profiles

Stores user information linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('customer', 'admin')) NOT NULL DEFAULT 'customer',
  reward_points INT DEFAULT 0,
  preferred_language TEXT DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Links to auth.users |
| full_name | TEXT | User's display name |
| role | TEXT | 'customer' or 'admin' |
| reward_points | INT | Accumulated rewards |
| preferred_language | TEXT | 'en', 'am', or 'om' |
| avatar_url | TEXT | Profile image URL |

---

### 2. Restaurants

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_open BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Restaurant name |
| description | TEXT | About the restaurant |
| image_url | TEXT | Cover image URL |
| is_active | BOOLEAN | Admin can deactivate |
| is_open | BOOLEAN | Currently accepting orders |
| created_by | UUID | Admin who created it |

---

### 3. Categories (Global)

Shared across all restaurants.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Seed data
INSERT INTO categories (name) VALUES
  ('Burgers'),
  ('Pizza'),
  ('Pasta'),
  ('Chicken'),
  ('Salads'),
  ('Sides'),
  ('Desserts'),
  ('Drinks');
```

---

### 4. Menu Items

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| restaurant_id | UUID | Parent restaurant |
| category_id | UUID | Global category |
| name | TEXT | Dish name |
| price | NUMERIC | Price in local currency |
| is_available | BOOLEAN | Currently orderable |

---

### 5. Carts

```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Cart Items

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL CHECK (quantity > 0)
);
```

---

### 7. Orders

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  restaurant_id UUID REFERENCES restaurants(id),
  total_amount NUMERIC(10,2),
  status TEXT CHECK (
    status IN ('pending', 'scheduled', 'preparing', 'delivered', 'cancelled')
  ) DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ,  -- NULL = instant order
  reward_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Status | Description |
|--------|-------------|
| pending | Order placed, awaiting preparation |
| scheduled | Scheduled for future time |
| preparing | Restaurant is preparing |
| delivered | Order completed |
| cancelled | Order cancelled |

---

### 8. Order Items

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL,
  price NUMERIC(10,2) NOT NULL  -- Price at time of order
);
```

---

### 9. Reward Transactions

```sql
CREATE TABLE reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  points_earned INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 10. Reviews

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  restaurant_id UUID REFERENCES restaurants(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Storage Bucket

```sql
-- Create public bucket for food images
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

---

## Row Level Security (RLS)

### Categories

```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);
```

### Menu Items

```sql
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu items are viewable by everyone"
  ON menu_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage menu items"
  ON menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Restaurants

```sql
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants are viewable by everyone"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage restaurants"
  ON restaurants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Orders

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Entity Relationships

```
profiles
    │
    ├── restaurants (created_by)
    │       │
    │       └── menu_items
    │               │
    │               └── categories (global)
    │
    ├── orders
    │       │
    │       ├── order_items
    │       └── reward_transactions
    │
    ├── carts
    │       │
    │       └── cart_items
    │
    └── reviews
```

---

## Quick Reference

| Table | Key Columns |
|-------|-------------|
| profiles | id, role, reward_points |
| restaurants | id, name, is_open, is_active |
| categories | id, name |
| menu_items | id, restaurant_id, category_id, price |
| orders | id, user_id, restaurant_id, status |
| reviews | id, user_id, restaurant_id, rating |
