-- USERS & ROLES
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- SELLERS
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  business_name VARCHAR(255) NOT NULL,
  business_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  gst_number VARCHAR(50),
  pan_number VARCHAR(50),
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES categories(id),
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES sellers(id),
  category_id INTEGER REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price_inr DECIMAL(10,2) NOT NULL,
  compare_price_inr DECIMAL(10,2),
  weight_kg DECIMAL(5,3),
  is_custom BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100),
  tags TEXT[],
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PRODUCT MEDIA
CREATE TABLE IF NOT EXISTS product_media (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type VARCHAR(10) DEFAULT 'image',
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50),
  color VARCHAR(50),
  stock INTEGER DEFAULT 0,
  price_inr DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  facebook_id VARCHAR(255),
  date_of_birth DATE,
  anniversary_date DATE,
  country VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'INR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS customer_addresses (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  country VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  seller_id INTEGER REFERENCES sellers(id),
  status VARCHAR(50) DEFAULT 'pending',
  subtotal_inr DECIMAL(10,2) NOT NULL,
  shipping_inr DECIMAL(10,2) DEFAULT 0,
  tax_inr DECIMAL(10,2) DEFAULT 0,
  total_inr DECIMAL(10,2) NOT NULL,
  commission_inr DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR',
  currency_rate DECIMAL(10,4) DEFAULT 1,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  tracking_number VARCHAR(255),
  courier VARCHAR(100),
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  variant_id INTEGER REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  price_inr DECIMAL(10,2) NOT NULL,
  custom_color VARCHAR(50),
  custom_size VARCHAR(50),
  custom_message TEXT,
  reference_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CART
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  variant_id INTEGER REFERENCES product_variants(id),
  quantity INTEGER DEFAULT 1,
  custom_color VARCHAR(50),
  custom_size VARCHAR(50),
  custom_message TEXT,
  reference_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id),
  order_id INTEGER REFERENCES orders(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  body TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ADMIN ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- DEFAULT ROLES
INSERT INTO roles (name, permissions) VALUES
('super_admin', '{"all": true}'),
('admin', '{"products": true, "orders": true, "reports": true, "sellers": true}'),
('product_manager', '{"products": true, "inventory": true}'),
('order_manager', '{"orders": true, "shipping": true, "returns": true}'),
('finance_manager', '{"reports": true, "finances": true}'),
('seller', '{"own_products": true, "own_orders": true, "own_earnings": true}'),
('support', '{"orders": true, "customers": true}')
ON CONFLICT DO NOTHING;

-- DEFAULT CATEGORIES
INSERT INTO categories (name, slug, description) VALUES
('Women', 'women', 'Women''s ethnic and western wear'),
('Men', 'men', 'Men''s ethnic and western wear'),
('Kids', 'kids', 'Kids ethnic and casual wear'),
('Jewellery', 'jewellery', 'Artificial and bridal jewellery'),
('Footwear', 'footwear', 'Handcrafted Indian footwear'),
('Gifts', 'gifts', 'Personalised and custom gifts'),
('Parcels', 'parcels', 'Ship anything anywhere'),
('Snacks', 'snacks', 'Authentic Indian snacks')
ON CONFLICT DO NOTHING;
