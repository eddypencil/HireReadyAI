-- Add stage_state JSONB column to application_stages
-- This column tracks the multi-agent interview pipeline state:
-- competency coverage, weakness flags, follow-up budget, questions completed
ALTER TABLE application_stages ADD COLUMN IF NOT EXISTS stage_state JSONB DEFAULT '{}';
