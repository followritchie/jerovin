-- ============================================================
-- JEROVIN SCHEMA MIGRATION
-- Run this once against your PostgreSQL database.
-- Safe to run multiple times (all changes are IF NOT EXISTS / DO NOTHING).
-- ============================================================

-- 1. Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_type VARCHAR(20) DEFAULT 'free';
ALTER TABLE products ADD COLUMN IF NOT EXISTS india_shipping_inr DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS international_shipping_inr DECIMAL(10,2) DEFAULT 2800;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';

-- 2. Add missing columns to product_drafts table (if it exists)
ALTER TABLE product_drafts ADD COLUMN IF NOT EXISTS brand VARCHAR(255);

-- 3. Ensure product_drafts.category_id is TEXT (stores slugs until publish)
--    Only run if column is NOT already text type.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='product_drafts' AND column_name='category_id'
    AND data_type != 'text' AND data_type != 'character varying'
  ) THEN
    ALTER TABLE product_drafts ALTER COLUMN category_id TYPE TEXT;
  END IF;
END $$;

-- 4. Make sure categories has all the sub-categories from schema-update.sql
--    (safe to re-run: ON CONFLICT DO NOTHING)
INSERT INTO categories (name, slug, description, parent_id) VALUES
('Sarees',               'women-sarees',           'All types of sarees',          (SELECT id FROM categories WHERE slug='women'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Lehengas',             'women-lehengas',          'Bridal and party lehengas',    (SELECT id FROM categories WHERE slug='women'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Blouses',              'women-blouses',           'Custom and designer blouses',  (SELECT id FROM categories WHERE slug='women'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Designer Kurta Sets',  'women-kurta-sets',        'Designer kurta sets',          (SELECT id FROM categories WHERE slug='women'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Designer Sarees',      'women-sarees-designer',   'Designer sarees',              (SELECT id FROM categories WHERE slug='women-sarees'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Uppada Silk Sarees',   'women-sarees-uppada',     'Uppada silk sarees',           (SELECT id FROM categories WHERE slug='women-sarees'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Kanjivaram Silk Sarees','women-sarees-kanjivaram','Kanjivaram silk sarees',       (SELECT id FROM categories WHERE slug='women-sarees'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Sherwanis',            'men-sherwanis',           'Wedding sherwanis',            (SELECT id FROM categories WHERE slug='men'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Kurtas',               'men-kurtas',              'Casual and formal kurtas',     (SELECT id FROM categories WHERE slug='men'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Blazers',              'men-blazers',             'Blazers and jackets',          (SELECT id FROM categories WHERE slug='men'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Indo Western',         'men-indo-western',        'Indo western fusion',          (SELECT id FROM categories WHERE slug='men'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Boys',                 'kids-boys',               'Boys clothing',                (SELECT id FROM categories WHERE slug='kids'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Girls',                'kids-girls',              'Girls clothing',               (SELECT id FROM categories WHERE slug='kids'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Rings',                'jewellery-rings',         'Rings',                        (SELECT id FROM categories WHERE slug='jewellery'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Earrings',             'jewellery-earrings',      'Earrings',                     (SELECT id FROM categories WHERE slug='jewellery'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Pendants',             'jewellery-pendants',      'Pendants and necklaces',       (SELECT id FROM categories WHERE slug='jewellery'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Clips',                'jewellery-clips',         'Hair clips and accessories',   (SELECT id FROM categories WHERE slug='jewellery'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_id) VALUES
('Handicrafts',          'handicrafts',             'Authentic Indian handicrafts', NULL)
ON CONFLICT (slug) DO NOTHING;

-- 5. Fix any existing products that have slug-based category_id (TEXT) 
--    which would fail the INTEGER foreign key. This back-fills them.
UPDATE products p
SET category_id = (SELECT id FROM categories WHERE slug = p.category_id::text)
WHERE p.category_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM categories WHERE id = p.category_id);

-- 6. Useful index additions
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 7. Verify categories are in place
SELECT slug, name, parent_id FROM categories ORDER BY parent_id NULLS FIRST, slug;