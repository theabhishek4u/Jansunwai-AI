-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  state text not null,
  district text not null,
  parliamentary_constituency text not null,
  assembly_constituency text not null,
  village_ward text,
  pincode text not null,
  language_preference text default 'en',
  contribution_score integer default 0,
  avatar_url text,
  role text default 'citizen',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table profiles enable row level security;

-- Profiles Policies
create policy "Allow public read access to profiles" on profiles
  for select using (true);

create policy "Allow users to update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Allow users to insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- 2. Suggestions Table
create table if not exists suggestions (
  id uuid default gen_random_uuid() primary key,
  citizen_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  category text not null,
  description text not null,
  location_lat double precision,
  location_lng double precision,
  village text,
  block text,
  district text not null,
  state text not null,
  estimated_beneficiaries integer default 0,
  urgency text check (urgency in ('low', 'medium', 'high', 'critical')) default 'medium',
  status text check (status in (
    'submitted', 'ai_processing', 'duplicate_checked', 
    'infra_analyzed', 'demand_analyzed', 'under_review', 
    'accepted', 'rejected', 'planned', 'completed'
  )) default 'submitted',
  
  -- AI Scores
  ai_score_completeness integer check (ai_score_completeness >= 0 and ai_score_completeness <= 100),
  ai_score_impact text check (ai_score_impact in ('low', 'medium', 'high', 'critical', 'Low', 'Medium', 'High', 'Critical')),
  ai_score_location_verified boolean default false,
  ai_score_photo_verified boolean default false,
  ai_score_confidence integer check (ai_score_confidence >= 0 and ai_score_confidence <= 100),
  
  -- Duplicate Grouping
  duplicate_of_id uuid references suggestions(id) on delete set null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Suggestions
alter table suggestions enable row level security;

-- Suggestions Policies
create policy "Allow public read access to suggestions" on suggestions
  for select using (true);

create policy "Allow authenticated users to create suggestions" on suggestions
  for insert with check (auth.uid() = citizen_id);

create policy "Allow users to update their own suggestions" on suggestions
  for update using (auth.uid() = citizen_id);

-- 3. Media Attachments Table
create table if not exists media_attachments (
  id uuid default gen_random_uuid() primary key,
  suggestion_id uuid references suggestions(id) on delete cascade not null,
  file_url text not null,
  file_type text check (file_type in ('image', 'video', 'voice', 'pdf')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Media Attachments
alter table media_attachments enable row level security;

create policy "Allow public read access to media attachments" on media_attachments
  for select using (true);

create policy "Allow authenticated users to insert attachments" on media_attachments
  for insert with check (true); -- Verified via storage permissions

-- 4. Timeline Events Table
create table if not exists timeline_events (
  id uuid default gen_random_uuid() primary key,
  suggestion_id uuid references suggestions(id) on delete cascade not null,
  status text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Timeline Events
alter table timeline_events enable row level security;

create policy "Allow public read access to timeline" on timeline_events
  for select using (true);

-- 5. User Badges Table
create table if not exists user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  badge_type text check (badge_type in ('top_contributor', 'community_leader', 'verified_citizen', 'problem_solver')) not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, badge_type)
);

-- Enable RLS on User Badges
alter table user_badges enable row level security;

create policy "Allow public read access to badges" on user_badges
  for select using (true);
