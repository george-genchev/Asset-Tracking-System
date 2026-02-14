-- Migration: 002_fix_function_search_path
-- Description: Fix function search_path security warnings
-- Date: 2026-02-15

-- Update update_updated_at_column function with search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update handle_new_user function with search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
