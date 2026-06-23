-- Initial Schema for Live Python Workshop

-- Note: In a real Supabase setup, you'd integrate with auth.users.
-- For the MVP, we use a custom profiles table that can be linked later.

CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');

CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workshops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  mentor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id),
  join_code TEXT UNIQUE,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'ended'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checkpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id),
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  starter_code TEXT,
  expected_output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE progress_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES profiles(id),
  checkpoint_id UUID REFERENCES checkpoints(id),
  status TEXT DEFAULT 'attempted', -- 'attempted', 'passed', 'failed'
  code_snapshot TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  badge_type TEXT NOT NULL, -- e.g., 'first_loop', 'first_function'
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) policies can be added here later for production
