-- Step 2: Appeals + Company Management Schema
-- Run this in Supabase SQL Editor

-- 1. Add appeal columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS appeal_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS appeal_message text,
  ADD COLUMN IF NOT EXISTS appeal_status text NOT NULL DEFAULT 'none';

-- 2. Add closing + appeal columns to companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS closing_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS appeal_message text,
  ADD COLUMN IF NOT EXISTS appeal_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS appeal_deadline timestamptz;

-- 3. Create company_actions table (mirrors user_actions)
CREATE TABLE IF NOT EXISTS company_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) NOT NULL,
  action_type text NOT NULL,
  reason text,
  duration_days int,
  duration_hours int,
  applied_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_company_actions_company_id ON company_actions(company_id);

-- 4. Create appeal_messages table (threaded conversations)
CREATE TABLE IF NOT EXISTS appeal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('profile', 'company')),
  entity_id uuid NOT NULL,
  sender_id uuid REFERENCES profiles(id),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appeal_messages_entity ON appeal_messages(entity_type, entity_id);

-- 5. Enable realtime for needed tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS appeal_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS companies;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS company_memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS reports;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS technical_issues;
