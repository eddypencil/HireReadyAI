-- Step 1: Admin Trust & Safety Schema
-- Run this in Supabase SQL Editor

-- 1. Add admin role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- 2. Add account status columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS frozen_until timestamptz,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS severity_score int NOT NULL DEFAULT 0;

-- 3. Add account status + severity score to companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS severity_score int NOT NULL DEFAULT 0;

-- 4. Create user_actions table (admin actions: warn/freeze/ban/active)
CREATE TABLE IF NOT EXISTS user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  action_type text NOT NULL,
  reason text,
  duration_days int,
  duration_hours int,
  applied_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);

-- 5. Create reports table (user-submitted violations)
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id),
  report_type text NOT NULL,
  target_id uuid NOT NULL,
  target_details jsonb,
  subject text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  resolution_notes text,
  action_taken text,
  scored_entity_type text,
  scored_entity_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);

-- 6. Create technical_issues table (platform bugs, AI errors, etc.)
CREATE TABLE IF NOT EXISTS technical_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id),
  issue_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  related_report_id uuid REFERENCES reports(id),
  assigned_to uuid REFERENCES profiles(id),
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_technical_issues_status ON technical_issues(status);
