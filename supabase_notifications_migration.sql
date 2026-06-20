-- ============================================================
-- Migration: Add expo_push_token column to profiles table
-- Run this once in Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Optional: Index for quick lookups (not required but helpful at scale)
CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token
  ON profiles (expo_push_token)
  WHERE expo_push_token IS NOT NULL;
