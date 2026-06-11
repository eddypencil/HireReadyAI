-- Create ENUM type for membership permissions
DO $$ BEGIN
  CREATE TYPE membership_permission AS ENUM ('pending', 'recruiter', 'hr_manager');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add recruiter_permissions column to company_memberships
ALTER TABLE company_memberships ADD COLUMN IF NOT EXISTS recruiter_permissions membership_permission;

-- Add new columns to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cover_url    text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_url  text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founding_date date;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description  text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS culture      text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS benefits     text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS twitter_url  text;

-- Migrate existing data from old jsonb permissions to recruiter_permissions
UPDATE company_memberships
SET recruiter_permissions =
  CASE
    WHEN permissions->>'role' = 'admin'     THEN 'hr_manager'::membership_permission
    WHEN permissions->>'role' = 'recruiter'  THEN 'recruiter'::membership_permission
    ELSE 'pending'::membership_permission
  END
WHERE recruiter_permissions IS NULL
  AND permissions IS NOT NULL;

-- Add premium subscription columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Add premium subscription columns to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id text;
