-- Migration: 003_add_orders_table
-- Description: Create orders lookup table and modify assets table to reference it
-- Date: 2026-02-15

-- =============================================
-- 1. Create orders table
-- =============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. Seed orders reference data
-- =============================================

INSERT INTO orders (name) VALUES
  ('Market'),
  ('Market (OPG)');

-- =============================================
-- 3. Enable Row Level Security on orders
-- =============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. Create RLS policy for orders (public read)
-- =============================================

CREATE POLICY "Authenticated users can view orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- 5. Modify assets table to use order_id instead of order
-- =============================================

-- Add new order_id column as UUID foreign key
ALTER TABLE assets ADD COLUMN order_id UUID REFERENCES orders(id);

-- Create index for performance
CREATE INDEX idx_assets_order_id ON assets(order_id);

-- Drop old order column (if it had data, you'd need to migrate it first)
ALTER TABLE assets DROP COLUMN "order";

-- =============================================
-- End of migration
-- =============================================
