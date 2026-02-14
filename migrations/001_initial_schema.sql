-- Migration: 001_initial_schema
-- Description: Create initial database schema for Asset Tracking System
-- Date: 2026-02-15

-- =============================================
-- 1. Create custom types
-- =============================================

CREATE TYPE roles AS ENUM ('admin', 'user');

-- =============================================
-- 2. Create tables
-- =============================================

-- User roles table
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role roles NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Targets lookup table
CREATE TABLE targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Strategies table
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  exchange TEXT,
  date DATE NOT NULL,
  quantity NUMERIC NOT NULL,
  "order" INTEGER,
  target_id UUID NOT NULL REFERENCES targets(id),
  action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. Create indexes for performance
-- =============================================

CREATE INDEX idx_strategies_owner_id ON strategies(owner_id);
CREATE INDEX idx_assets_strategy_id ON assets(strategy_id);
CREATE INDEX idx_assets_target_id ON assets(target_id);

-- =============================================
-- 4. Seed reference data
-- =============================================

INSERT INTO targets (name) VALUES
  ('Open Position'),
  ('Close Position'),
  ('Rebalancing');

-- =============================================
-- 5. Create functions for updated_at triggers
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. Create triggers
-- =============================================

-- Trigger for strategies updated_at
CREATE TRIGGER strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for assets updated_at
CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-create user_roles on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 7. Enable Row Level Security
-- =============================================

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. Create RLS Policies
-- =============================================

-- Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own role on signup"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policies for targets (public read for authenticated users)
CREATE POLICY "Authenticated users can view targets"
  ON targets
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for strategies
CREATE POLICY "Users can view their own strategies"
  ON strategies
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own strategies"
  ON strategies
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own strategies"
  ON strategies
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own strategies"
  ON strategies
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Policies for assets
CREATE POLICY "Users can view assets in their own strategies"
  ON assets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = assets.strategy_id
      AND strategies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assets in their own strategies"
  ON assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = assets.strategy_id
      AND strategies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assets in their own strategies"
  ON assets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = assets.strategy_id
      AND strategies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = assets.strategy_id
      AND strategies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete assets from their own strategies"
  ON assets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM strategies
      WHERE strategies.id = assets.strategy_id
      AND strategies.owner_id = auth.uid()
    )
  );

-- =============================================
-- End of migration
-- =============================================
