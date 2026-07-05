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

-- 17. Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  xp_reward integer DEFAULT 50 NOT NULL
);

-- 18. User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  badge_id integer REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, badge_id)
);

-- 19. Support Votes Table
CREATE TABLE IF NOT EXISTS public.support_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, suggestion_id)
);

-- 20. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 21. Reports Table
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

-- 3. Citizen Profiles Policies
CREATE POLICY "Citizens/MPs/Admins can read profiles" ON public.citizen_profiles
  FOR SELECT USING (auth.uid() = id OR public.get_user_role(auth.uid()) IN ('mp', 'admin'));
CREATE POLICY "Citizens can update own profile" ON public.citizen_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow profile insertion" ON public.citizen_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. MP Profiles Policies
CREATE POLICY "Allow public read MP profiles" ON public.mp_profiles
  FOR SELECT USING (true);
CREATE POLICY "MPs can update own profile" ON public.mp_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage MP profiles" ON public.mp_profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- 5. Admin Profiles Policies
CREATE POLICY "Admins can select admin profiles" ON public.admin_profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update own profile" ON public.admin_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 6. Suggestions Table Policies
CREATE POLICY "Suggestions visibility policy" ON public.suggestions
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'admin'
    OR public.get_user_role(auth.uid()) = 'citizen'
    OR (
      public.get_user_role(auth.uid()) = 'mp'
      AND (
        suggestions.parliamentary_constituency IS NULL
        OR EXISTS (
          SELECT 1 FROM public.mp_profiles
          WHERE mp_profiles.id = auth.uid()
          AND mp_profiles.parliamentary_constituency = suggestions.parliamentary_constituency
        )
      )
    )
  );
CREATE POLICY "Citizens can insert suggestions" ON public.suggestions
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Citizens can edit own suggestions" ON public.suggestions
  FOR UPDATE USING (auth.uid() = citizen_id);
CREATE POLICY "MPs can moderate suggestions in constituency" ON public.suggestions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.mp_profiles
      WHERE mp_profiles.id = auth.uid()
      AND mp_profiles.parliamentary_constituency = suggestions.parliamentary_constituency
    )
  );
CREATE POLICY "Admins can manage suggestions" ON public.suggestions
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- 7. Attachments Table Policies
CREATE POLICY "Allow read attachments" ON public.attachments FOR SELECT USING (true);
CREATE POLICY "Allow insert attachments" ON public.attachments FOR INSERT WITH CHECK (true);

-- 8. Notifications Table Policies
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- 9. AI Analysis / Priority Scores
CREATE POLICY "Read AI metrics" ON public.ai_analysis FOR SELECT USING (true);
CREATE POLICY "Read AI priority" ON public.ai_priority_scores FOR SELECT USING (true);

-- 10. Activity Logs Policies
CREATE POLICY "Write log" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view logs" ON public.activity_logs
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- 11. Badges & User Badges Policies
CREATE POLICY "Read user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Allow badge earning" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. Support Votes / Comments / Reports Policies
CREATE POLICY "Read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Write comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Read votes" ON public.support_votes FOR SELECT USING (true);
CREATE POLICY "Cast vote" ON public.support_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Remove vote" ON public.support_votes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Submit report" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read/resolve reports" ON public.reports
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

--------------------------------------------------------------------------------
-- TRIGGERS TO AUTOMATICALLY CREATE PROFILES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_full_name text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'citizen');
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
      NEW.raw_user_meta_data->>'parliamentary_constituency',
      NEW.raw_user_meta_data->>'state',
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
