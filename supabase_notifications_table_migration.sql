-- Migration: Create notifications table for in-app notifications
-- Run this in Supabase SQL editor

create table public.notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean null default false,
  created_at timestamp with time zone null default now(),
  related_application_id uuid null,
  related_job_id uuid null,
  constraint notifications_pkey primary key (id),
  constraint fk_notifications_applications foreign KEY (related_application_id) references applications (id) on delete set null,
  constraint fk_notifications_jobs foreign KEY (related_job_id) references job_postings (id) on delete set null,
  constraint fk_notifications_profiles foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_notifications_user_id_is_read on public.notifications using btree (user_id, is_read) TABLESPACE pg_default;

create index IF not exists idx_notifications_user_id_created_at on public.notifications using btree (user_id, created_at desc) TABLESPACE pg_default;

-- Enable Row Level Security
alter table public.notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Allow any authenticated user to insert (notifications are created for others during app actions)
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

-- Users can only update their own notifications (e.g. mark as read)
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);
