-- =============================================================================
-- Pulse — Supabase Schema
-- Run this entire script in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Create the public.users profile table
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  name             text,
  phone            text,
  gender           text,
  graduation_year  text,
  hall             text,
  phone_verified   boolean not null default false,
  host_verified_at timestamptz,
  avatar_url       text,
  created_at       timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. Enable Row Level Security
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;

-- Users can read their own profile
drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own profile
drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 3. Auto-create profile row when a new auth user signs up
--    (trigger fires on every INSERT into auth.users)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop old trigger if it exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Done! You should now see a "users" table under Table Editor.
-- -----------------------------------------------------------------------------

-- =============================================================================
-- ENUMS
-- =============================================================================
CREATE TYPE public.activity_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE public.request_status AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'LEFT', 'REMOVED');
CREATE TYPE public.activity_gender AS ENUM ('Any', 'Male', 'Female');

-- =============================================================================
-- TRIGGERS FUNCTION FOR UPDATED_AT
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ACTIVITIES TABLE
-- =============================================================================
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    title TEXT NOT NULL,
    about TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    meetup_point TEXT NOT NULL,
    activity_location TEXT,
    max_participants INTEGER NOT NULL,
    gender public.activity_gender DEFAULT 'Any',
    eligibility_tags TEXT[],
    estimated_cost INTEGER,
    chat_enabled BOOLEAN DEFAULT true,
    accept_requests_until TIMESTAMPTZ,
    status public.activity_status DEFAULT 'UPCOMING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER handle_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- ACTIVITY REQUESTS TABLE
-- =============================================================================
CREATE TABLE public.activity_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status public.request_status DEFAULT 'REQUESTED',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (activity_id, user_id)
);

CREATE TRIGGER handle_requests_updated_at
  BEFORE UPDATE ON public.activity_requests
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- DOCUMENTS & PHOTOS
-- =============================================================================
CREATE TABLE public.activity_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.activity_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ADVANCED CONSTRAINTS & BUSINESS LOGIC
-- =============================================================================

-- Prevent Host from Requesting to Join Their Own Activity
CREATE OR REPLACE FUNCTION public.check_host_request()
RETURNS TRIGGER AS $$
DECLARE
  v_host_id UUID;
BEGIN
  SELECT host_id INTO v_host_id FROM public.activities WHERE id = NEW.activity_id;
  IF v_host_id = NEW.user_id THEN
    RAISE EXCEPTION 'Host cannot request to join their own activity';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_host_cannot_join
  BEFORE INSERT ON public.activity_requests
  FOR EACH ROW
  EXECUTE PROCEDURE public.check_host_request();

-- Prevent Overbooking
CREATE OR REPLACE FUNCTION public.check_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_max INTEGER;
  v_current INTEGER;
BEGIN
  IF OLD.status != 'APPROVED' AND NEW.status = 'APPROVED' THEN
    SELECT max_participants INTO v_max FROM public.activities WHERE id = NEW.activity_id;
    SELECT COUNT(*) INTO v_current FROM public.activity_requests WHERE activity_id = NEW.activity_id AND status = 'APPROVED';
    
    IF v_current >= v_max THEN
      RAISE EXCEPTION 'Activity has reached maximum capacity';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_capacity_limit
  BEFORE UPDATE ON public.activity_requests
  FOR EACH ROW
  EXECUTE PROCEDURE public.check_capacity();

-- Validate Request Deadline
CREATE OR REPLACE FUNCTION public.check_deadline()
RETURNS TRIGGER AS $$
DECLARE
  v_deadline TIMESTAMPTZ;
BEGIN
  SELECT accept_requests_until INTO v_deadline FROM public.activities WHERE id = NEW.activity_id;
  IF v_deadline IS NOT NULL AND NOW() > v_deadline THEN
    RAISE EXCEPTION 'Request deadline has passed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_request_deadline
  BEFORE INSERT ON public.activity_requests
  FOR EACH ROW
  EXECUTE PROCEDURE public.check_deadline();

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX idx_activities_host_id ON public.activities(host_id);
CREATE INDEX idx_activities_status ON public.activities(status);
CREATE INDEX idx_activities_cat_subcat ON public.activities(category, subcategory);
CREATE INDEX idx_activities_starts_at ON public.activities(starts_at);

CREATE INDEX idx_requests_activity_id ON public.activity_requests(activity_id);
CREATE INDEX idx_requests_user_id ON public.activity_requests(user_id);
CREATE INDEX idx_requests_status ON public.activity_requests(status);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;

-- Activities RLS
DROP POLICY IF EXISTS "Anyone can view active activities" ON public.activities;
CREATE POLICY "Anyone can view active activities"
  ON public.activities FOR SELECT
  USING (deleted_at IS NULL OR host_id = auth.uid());

DROP POLICY IF EXISTS "Users can create activities" ON public.activities;
CREATE POLICY "Users can create activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Hosts can update their activities" ON public.activities;
CREATE POLICY "Hosts can update their activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- Activity Requests RLS
DROP POLICY IF EXISTS "Users can view their own requests and host can view all requests" ON public.activity_requests;
CREATE POLICY "Users can view their own requests and host can view all requests"
  ON public.activity_requests FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    auth.uid() IN (SELECT host_id FROM public.activities WHERE id = activity_id)
    OR
    (status = 'APPROVED' AND auth.uid() IN (SELECT user_id FROM public.activity_requests WHERE activity_id = activity_requests.activity_id AND status = 'APPROVED'))
  );

DROP POLICY IF EXISTS "Users can create requests for themselves" ON public.activity_requests;
CREATE POLICY "Users can create requests for themselves"
  ON public.activity_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own status or host can update status" ON public.activity_requests;
CREATE POLICY "Users can update their own status or host can update status"
  ON public.activity_requests FOR UPDATE
  USING (
    user_id = auth.uid() 
    OR 
    auth.uid() IN (SELECT host_id FROM public.activities WHERE id = activity_id)
  );

-- Documents and Photos RLS (Read-only for all, host can insert)
DROP POLICY IF EXISTS "Anyone can view documents" ON public.activity_documents;
CREATE POLICY "Anyone can view documents"
  ON public.activity_documents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Host can add documents" ON public.activity_documents;
CREATE POLICY "Host can add documents"
  ON public.activity_documents FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT host_id FROM public.activities WHERE id = activity_id));

DROP POLICY IF EXISTS "Anyone can view photos" ON public.activity_photos;
CREATE POLICY "Anyone can view photos"
  ON public.activity_photos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Host can add photos" ON public.activity_photos;
CREATE POLICY "Host can add photos"
  ON public.activity_photos FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT host_id FROM public.activities WHERE id = activity_id));
