-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. States Table
CREATE TABLE IF NOT EXISTS public.states (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);

-- 2. Districts Table
CREATE TABLE IF NOT EXISTS public.districts (
  id serial PRIMARY KEY,
  state_id integer REFERENCES public.states(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  UNIQUE (state_id, name)
);

-- 3. Blocks Table
CREATE TABLE IF NOT EXISTS public.blocks (
  id serial PRIMARY KEY,
  district_id integer REFERENCES public.districts(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  UNIQUE (district_id, name)
);

-- 4. Villages Table
CREATE TABLE IF NOT EXISTS public.villages (
  id serial PRIMARY KEY,
  block_id integer REFERENCES public.blocks(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  UNIQUE (block_id, name)
);

-- 5. Constituencies Table
CREATE TABLE IF NOT EXISTS public.constituencies (
  id serial PRIMARY KEY,
  state_id integer REFERENCES public.states(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('parliamentary', 'assembly')) NOT NULL,
  UNIQUE (state_id, name, type)
);

-- 6. Users Table (Mirror of auth.users with roles)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  role text CHECK (role IN ('citizen', 'mp', 'admin')) DEFAULT 'citizen' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 7. Citizen Profiles Table
CREATE TABLE IF NOT EXISTS public.citizen_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  phone text,
  pincode text,
  language_preference text DEFAULT 'en' NOT NULL,
  contribution_score integer DEFAULT 0 NOT NULL,
  avatar_url text,
  state text,
  district text,
  parliamentary_constituency text,
  assembly_constituency text,
  village_ward text,
  state_id integer REFERENCES public.states(id),
  district_id integer REFERENCES public.districts(id),
  parliamentary_constituency_id integer REFERENCES public.constituencies(id),
  assembly_constituency_id integer REFERENCES public.constituencies(id),
  village_id integer REFERENCES public.villages(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 8. MP Profiles Table
CREATE TABLE IF NOT EXISTS public.mp_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  parliamentary_constituency text,
  state text,
  parliamentary_constituency_id integer REFERENCES public.constituencies(id),
  state_id integer REFERENCES public.states(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 9. Admin Profiles Table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 10. Suggestion Categories Table
CREATE TABLE IF NOT EXISTS public.suggestion_categories (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);

-- 11. Suggestions Table
CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text,
  category_id integer REFERENCES public.suggestion_categories(id),
  description text NOT NULL,
  location_lat double precision,
  location_lng double precision,
  state text,
  district text,
  block text,
  village text,
  parliamentary_constituency text,
  assembly_constituency text,
  state_id integer REFERENCES public.states(id),
  district_id integer REFERENCES public.districts(id),
  block_id integer REFERENCES public.blocks(id),
  village_id integer REFERENCES public.villages(id),
  parliamentary_constituency_id integer REFERENCES public.constituencies(id),
  assembly_constituency_id integer REFERENCES public.constituencies(id),
  estimated_beneficiaries integer DEFAULT 0 NOT NULL,
  urgency text CHECK (urgency IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium' NOT NULL,
  status text CHECK (status IN (
    'submitted', 'ai_processing', 'duplicate_checked', 
    'infra_analyzed', 'demand_analyzed', 'under_review', 
    'accepted', 'rejected', 'planned', 'completed'
  )) DEFAULT 'submitted' NOT NULL,
  duplicate_of_id uuid REFERENCES public.suggestions(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 12. Attachments Table
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_type text CHECK (file_type IN ('image', 'video', 'voice', 'pdf')) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 14. AI Analysis Table
CREATE TABLE IF NOT EXISTS public.ai_analysis (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  completeness_score integer CHECK (completeness_score >= 0 AND completeness_score <= 100),
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  location_verified boolean DEFAULT false NOT NULL,
  photo_verified boolean DEFAULT false NOT NULL,
  suggestions_summary text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 15. AI Priority Scores Table
CREATE TABLE IF NOT EXISTS public.ai_priority_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  priority_score integer CHECK (priority_score >= 0 AND priority_score <= 100) NOT NULL,
  infrastructure_gap_score integer CHECK (infrastructure_gap_score >= 0 AND infrastructure_gap_score <= 100),
  community_demand_score integer CHECK (community_demand_score >= 0 AND community_demand_score <= 100),
  urgency_score integer CHECK (urgency_score >= 0 AND urgency_score <= 100),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 16. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  action text NOT NULL,
  details text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 17. Timeline Events Table (For suggestion tracking)
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 18. Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  xp_reward integer DEFAULT 50 NOT NULL
);

-- 19. User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL,
  earned_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, badge_type)
);

-- 20. Support Votes Table
CREATE TABLE IF NOT EXISTS public.support_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, suggestion_id)
);

-- 21. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 22. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  details text,
  status text CHECK (status IN ('pending', 'reviewed', 'resolved')) DEFAULT 'pending' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

--------------------------------------------------------------------------------
-- DATABASE VIEWS & TRIGGERS FOR SERVER COMPATIBILITY
--------------------------------------------------------------------------------

-- 1. Profiles Unified View (Combines citizen, mp, and admin profiles)
CREATE OR REPLACE VIEW public.profiles AS
  SELECT 
    id, 
    full_name, 
    avatar_url, 
    phone, 
    pincode, 
    language_preference, 
    contribution_score, 
    state, 
    district, 
    parliamentary_constituency, 
    assembly_constituency, 
    village_ward,
    'citizen'::text as role,
    created_at,
    updated_at
  FROM public.citizen_profiles
  UNION ALL
  SELECT 
    id, 
    full_name, 
    avatar_url, 
    phone, 
    NULL::text as pincode, 
    'en'::text as language_preference, 
    0 as contribution_score, 
    state, 
    NULL::text as district, 
    parliamentary_constituency, 
    NULL::text as assembly_constituency, 
    NULL::text as village_ward,
    'mp'::text as role,
    created_at,
    updated_at
  FROM public.mp_profiles
  UNION ALL
  SELECT 
    id, 
    full_name, 
    avatar_url, 
    phone, 
    NULL::text as pincode, 
    'en'::text as language_preference, 
    0 as contribution_score, 
    NULL::text as state, 
    NULL::text as district, 
    NULL::text as parliamentary_constituency, 
    NULL::text as assembly_constituency, 
    NULL::text as village_ward,
    'admin'::text as role,
    created_at,
    updated_at
  FROM public.admin_profiles;

-- 2. DML Trigger for Profiles View
CREATE OR REPLACE FUNCTION public.handle_profiles_dml()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' THEN
      INSERT INTO public.admin_profiles (id, full_name, avatar_url, phone)
      VALUES (NEW.id, NEW.full_name, NEW.avatar_url, NEW.phone)
      ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url, phone = EXCLUDED.phone;
    ELSIF NEW.role = 'mp' THEN
      INSERT INTO public.mp_profiles (id, full_name, avatar_url, phone, parliamentary_constituency, state)
      VALUES (NEW.id, NEW.full_name, NEW.avatar_url, NEW.phone, NEW.parliamentary_constituency, NEW.state)
      ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url, phone = EXCLUDED.phone, parliamentary_constituency = EXCLUDED.parliamentary_constituency, state = EXCLUDED.state;
    ELSE
      INSERT INTO public.citizen_profiles (id, full_name, avatar_url, phone, state, district, parliamentary_constituency, assembly_constituency, village_ward, pincode, language_preference, contribution_score)
      VALUES (NEW.id, NEW.full_name, NEW.avatar_url, NEW.phone, NEW.state, NEW.district, NEW.parliamentary_constituency, NEW.assembly_constituency, NEW.village_ward, NEW.pincode, COALESCE(NEW.language_preference, 'en'), COALESCE(NEW.contribution_score, 0))
      ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url, phone = EXCLUDED.phone, state = EXCLUDED.state, district = EXCLUDED.district, parliamentary_constituency = EXCLUDED.parliamentary_constituency, assembly_constituency = EXCLUDED.assembly_constituency, village_ward = EXCLUDED.village_ward, pincode = EXCLUDED.pincode, language_preference = EXCLUDED.language_preference, contribution_score = EXCLUDED.contribution_score;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role = 'admin' THEN
      UPDATE public.admin_profiles 
      SET full_name = NEW.full_name, avatar_url = NEW.avatar_url, phone = NEW.phone, updated_at = now()
      WHERE id = NEW.id;
    ELSIF NEW.role = 'mp' THEN
      UPDATE public.mp_profiles 
      SET full_name = NEW.full_name, avatar_url = NEW.avatar_url, phone = NEW.phone, parliamentary_constituency = NEW.parliamentary_constituency, state = NEW.state, updated_at = now()
      WHERE id = NEW.id;
    ELSE
      UPDATE public.citizen_profiles 
      SET full_name = NEW.full_name, avatar_url = NEW.avatar_url, phone = NEW.phone, state = NEW.state, district = NEW.district, parliamentary_constituency = NEW.parliamentary_constituency, assembly_constituency = NEW.assembly_constituency, village_ward = NEW.village_ward, pincode = NEW.pincode, language_preference = NEW.language_preference, contribution_score = NEW.contribution_score, updated_at = now()
      WHERE id = NEW.id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.admin_profiles WHERE id = OLD.id;
    DELETE FROM public.mp_profiles WHERE id = OLD.id;
    DELETE FROM public.citizen_profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_profiles_dml
  INSTEAD OF INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profiles_dml();

-- 3. Media Attachments Alias View (Maps to attachments)
CREATE OR REPLACE VIEW public.media_attachments AS
  SELECT id, suggestion_id, file_url, file_type, created_at
  FROM public.attachments;

CREATE OR REPLACE FUNCTION public.handle_media_attachments_insert()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.attachments (id, suggestion_id, file_url, file_type, created_at)
  VALUES (COALESCE(NEW.id, gen_random_uuid()), NEW.suggestion_id, NEW.file_url, NEW.file_type, COALESCE(NEW.created_at, now()));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_media_attachments_insert
  INSTEAD OF INSERT ON public.media_attachments
  FOR EACH ROW EXECUTE FUNCTION public.handle_media_attachments_insert();

--------------------------------------------------------------------------------
-- HELPER FUNCTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Enable RLS on every table
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_priority_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 1. Metadata Read policies (Public Select)
CREATE POLICY "Allow public read states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Allow public read districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Allow public read blocks" ON public.blocks FOR SELECT USING (true);
CREATE POLICY "Allow public read villages" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Allow public read constituencies" ON public.constituencies FOR SELECT USING (true);
CREATE POLICY "Allow public read categories" ON public.suggestion_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read badges" ON public.badges FOR SELECT USING (true);

-- 2. Users Table Policies
CREATE POLICY "Allow users to read their own record" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow admins to manage users" ON public.users
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- 1. Metadata Read policies (Public Select)
CREATE POLICY "Allow public read states" ON public.states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read districts" ON public.districts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read blocks" ON public.blocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read villages" ON public.villages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read constituencies" ON public.constituencies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read categories" ON public.suggestion_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read badges" ON public.badges FOR ALL USING (true) WITH CHECK (true);

-- 2. Users Table Policies
CREATE POLICY "Allow public manage users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 3. Citizen Profiles Policies
CREATE POLICY "Allow public manage citizen profiles" ON public.citizen_profiles FOR ALL USING (true) WITH CHECK (true);

-- 4. MP Profiles Policies
CREATE POLICY "Allow public manage MP profiles" ON public.mp_profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. Admin Profiles Policies
CREATE POLICY "Allow public manage admin profiles" ON public.admin_profiles FOR ALL USING (true) WITH CHECK (true);

-- 6. Suggestions Table Policies
CREATE POLICY "Allow public manage suggestions" ON public.suggestions FOR ALL USING (true) WITH CHECK (true);

-- 7. Attachments Table Policies
CREATE POLICY "Allow public manage attachments" ON public.attachments FOR ALL USING (true) WITH CHECK (true);

-- 8. Notifications Table Policies
CREATE POLICY "Allow public manage notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- 9. AI Analysis / Priority Scores
CREATE POLICY "Allow public manage AI metrics" ON public.ai_analysis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage AI priority" ON public.ai_priority_scores FOR ALL USING (true) WITH CHECK (true);

-- 10. Activity Logs Policies
CREATE POLICY "Allow public manage logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

-- 11. Timeline Events Policies
CREATE POLICY "Allow public manage timeline" ON public.timeline_events FOR ALL USING (true) WITH CHECK (true);

-- 12. Badges & User Badges Policies
CREATE POLICY "Allow public manage user badges" ON public.user_badges FOR ALL USING (true) WITH CHECK (true);

-- 13. Support Votes / Comments / Reports Policies
CREATE POLICY "Allow public manage comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage votes" ON public.support_votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public manage reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);

--------------------------------------------------------------------------------
-- TRIGGERS TO AUTOMATICALLY CREATE PROFILES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_full_name text;
BEGIN
  -- Auto-detect role based on email pattern or metadata
  IF NEW.email = 'admin@jansunwai.gov.in' THEN
    v_role := 'admin';
  ELSIF NEW.email = 'mp@jansunwai.gov.in' THEN
    v_role := 'mp';
  ELSE
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'citizen');
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, v_role);

  IF v_role = 'admin' THEN
    INSERT INTO public.admin_profiles (id, full_name, avatar_url)
    VALUES (NEW.id, v_full_name, NEW.raw_user_meta_data->>'avatar_url');
  ELSIF v_role = 'mp' THEN
    INSERT INTO public.mp_profiles (id, full_name, avatar_url, parliamentary_constituency, state, parliamentary_constituency_id, state_id)
    VALUES (
      NEW.id, 
      v_full_name, 
      NEW.raw_user_meta_data->>'avatar_url',
      COALESCE(NEW.raw_user_meta_data->>'parliamentary_constituency', 'Varanasi'),
      COALESCE(NEW.raw_user_meta_data->>'state', 'Uttar Pradesh'),
      (NEW.raw_user_meta_data->>'parliamentary_constituency_id')::integer,
      (NEW.raw_user_meta_data->>'state_id')::integer
    );
  ELSE
    INSERT INTO public.citizen_profiles (
      id, full_name, avatar_url, phone, state, district, parliamentary_constituency, assembly_constituency, village_ward, pincode, language_preference, state_id, district_id, parliamentary_constituency_id, assembly_constituency_id, village_id
    )
    VALUES (
      NEW.id,
      v_full_name,
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'state',
      NEW.raw_user_meta_data->>'district',
      NEW.raw_user_meta_data->>'parliamentary_constituency',
      NEW.raw_user_meta_data->>'assembly_constituency',
      NEW.raw_user_meta_data->>'village_ward',
      NEW.raw_user_meta_data->>'pincode',
      COALESCE(NEW.raw_user_meta_data->>'language_preference', 'en'),
      (NEW.raw_user_meta_data->>'state_id')::integer,
      (NEW.raw_user_meta_data->>'district_id')::integer,
      (NEW.raw_user_meta_data->>'parliamentary_constituency_id')::integer,
      (NEW.raw_user_meta_data->>'assembly_constituency_id')::integer,
      (NEW.raw_user_meta_data->>'village_id')::integer
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- SEED DATA
--------------------------------------------------------------------------------

-- Enable pgcrypto extension for crypt function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed States
INSERT INTO public.states (id, name) VALUES
(1, 'Uttar Pradesh'),
(2, 'Maharashtra'),
(3, 'Karnataka')
ON CONFLICT (id) DO NOTHING;

-- Seed Districts
INSERT INTO public.districts (id, state_id, name) VALUES
(1, 1, 'Varanasi'),
(2, 1, 'Lucknow'),
(3, 1, 'Kanpur'),
(4, 2, 'Mumbai'),
(5, 2, 'Pune'),
(6, 3, 'Bangalore')
ON CONFLICT (id) DO NOTHING;

-- Seed Suggestion Categories
INSERT INTO public.suggestion_categories (id, name) VALUES
(1, 'Roads & Infrastructure'),
(2, 'Water Supply'),
(3, 'Sanitation'),
(4, 'Healthcare'),
(5, 'Education'),
(6, 'Public Safety')
ON CONFLICT (id) DO NOTHING;

-- Seed Constituencies
INSERT INTO public.constituencies (id, state_id, name, type) VALUES
(1, 1, 'Varanasi', 'parliamentary'),
(2, 1, 'Lucknow', 'parliamentary'),
(3, 1, 'Kanpur', 'parliamentary'),
(4, 2, 'Mumbai South', 'parliamentary'),
(5, 2, 'Pune', 'parliamentary'),
(6, 3, 'Bangalore South', 'parliamentary'),
(7, 1, 'Varanasi Cantonment', 'assembly'),
(8, 1, 'Varanasi North', 'assembly'),
(9, 1, 'Varanasi South', 'assembly')
ON CONFLICT (id) DO NOTHING;

-- Seed Badges
INSERT INTO public.badges (id, name, description, xp_reward) VALUES
(1, 'First Suggestion', 'Submitted your first civic proposal.', 50),
(2, 'Civic Hero', 'Earned 5 votes of support from neighbors.', 100),
(3, 'Community Voice', 'Contributed 3 comments on suggestions.', 75)
ON CONFLICT (id) DO NOTHING;

-- Seed Users directly into auth.users (with password 'password')
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, instance_id) VALUES
(
  'd7b00000-0000-0000-0000-000000000001',
  'citizen@jansunwai.gov.in',
  crypt('password', gen_salt('bf')),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{"role":"citizen","full_name":"Aarav Sharma","state":"Uttar Pradesh","district":"Varanasi","parliamentary_constituency":"Varanasi","pincode":"221002"}',
  now(),
  now(),
  '00000000-0000-0000-0000-000000000000'
),
(
  'd7b00000-0000-0000-0000-000000000002',
  'mp@jansunwai.gov.in',
  crypt('password', gen_salt('bf')),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{"role":"mp","full_name":"Dr. Vikram Singh","state":"Uttar Pradesh","parliamentary_constituency":"Varanasi"}',
  now(),
  now(),
  '00000000-0000-0000-0000-000000000000'
),
(
  'd7b00000-0000-0000-0000-000000000003',
  'admin@jansunwai.gov.in',
  crypt('password', gen_salt('bf')),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin","full_name":"Super Administrator"}',
  now(),
  now(),
  '00000000-0000-0000-0000-000000000000'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Suggestions
INSERT INTO public.suggestions (id, citizen_id, title, category, category_id, description, location_lat, location_lng, state, district, parliamentary_constituency, assembly_constituency, estimated_beneficiaries, urgency, status) VALUES
(
  'e5c00000-0000-0000-0000-000000000001',
  'd7b00000-0000-0000-0000-000000000001',
  'Pothole Repair & Road Widening at Sigra Main Road',
  'Roads & Infrastructure',
  1,
  'The main road connecting Sigra crossing to the railway station has developed major potholes, causing high traffic congestion and risks for motorbikes. Needs resurfacing.',
  25.3176,
  82.9739,
  'Uttar Pradesh',
  'Varanasi',
  'Varanasi',
  'Varanasi Cantonment',
  15000,
  'high',
  'under_review'
),
(
  'e5c00000-0000-0000-0000-000000000002',
  'd7b00000-0000-0000-0000-000000000001',
  'Install Community Water Purification Plant in Sigra Ward',
  'Water Supply',
  2,
  'Water supplied in our locality is frequently contaminated. Establishing a small RO water filtration plant will benefit more than 400 households who currently buy drinking water.',
  25.3191,
  82.9754,
  'Uttar Pradesh',
  'Varanasi',
  'Varanasi',
  'Varanasi North',
  2500,
  'critical',
  'infra_analyzed'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Timeline Events
INSERT INTO public.timeline_events (suggestion_id, status, notes) VALUES
('e5c00000-0000-0000-0000-000000000001', 'submitted', 'Grievance submitted by citizen Aarav Sharma.'),
('e5c00000-0000-0000-0000-000000000001', 'under_review', 'MP Vikram Singh viewed this suggestion and moved it to review.'),
('e5c00000-0000-0000-0000-000000000002', 'submitted', 'Grievance submitted by citizen Aarav Sharma.'),
('e5c00000-0000-0000-0000-000000000002', 'ai_processing', 'AI analysis complete. High community urgency detected.')
ON CONFLICT DO NOTHING;

-- Seed AI Analysis
INSERT INTO public.ai_analysis (suggestion_id, completeness_score, confidence_score, location_verified, photo_verified, suggestions_summary) VALUES
('e5c00000-0000-0000-0000-000000000001', 95, 89, true, true, 'Detailed roadmap issue with location coordinates verified. Action recommended.'),
('e5c00000-0000-0000-0000-000000000002', 88, 92, true, false, 'Requests community RO drinking water plant to combat high tds contaminants.')
ON CONFLICT DO NOTHING;

-- Seed AI Priority Scores
INSERT INTO public.ai_priority_scores (suggestion_id, priority_score, infrastructure_gap_score, community_demand_score, urgency_score) VALUES
('e5c00000-0000-0000-0000-000000000001', 84, 75, 88, 80),
('e5c00000-0000-0000-0000-000000000002', 91, 85, 95, 93)
ON CONFLICT DO NOTHING;

-- Seed Comments
INSERT INTO public.comments (user_id, suggestion_id, content) VALUES
('d7b00000-0000-0000-0000-000000000001', 'e5c00000-0000-0000-0000-000000000001', 'This is highly critical! Yesterday three motorbikes skidded here.'),
('d7b00000-0000-0000-0000-000000000001', 'e5c00000-0000-0000-0000-000000000002', 'Clean drinking water is a basic need. We hope this is accepted soon.')
ON CONFLICT DO NOTHING;

-- Seed Support Votes
INSERT INTO public.support_votes (user_id, suggestion_id) VALUES
('d7b00000-0000-0000-0000-000000000001', 'e5c00000-0000-0000-0000-000000000001'),
('d7b00000-0000-0000-0000-000000000002', 'e5c00000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
