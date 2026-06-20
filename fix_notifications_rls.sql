-- Fix RLS policy on notifications table
-- Run this if you already created the table with the restrictive insert policy

-- Drop the old restrictive policy
drop policy if exists "Users can insert their own notifications" on public.notifications;

-- Create permissive insert policy (any authenticated user can insert)
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');
