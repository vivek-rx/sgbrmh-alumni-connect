-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  
  -- COMPULSORY FIELDS (Required during signup)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  batch_year INTEGER NOT NULL CHECK (batch_year >= 1970 AND batch_year <= 2030),
  course TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- OPTIONAL FIELDS (Can be added later)
  avatar_url TEXT,
  current_company TEXT,
  current_position TEXT,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  
  -- LOCATION DATA (For Alumni Map)
  current_city TEXT,
  current_country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- METADATA
  role TEXT DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni', 'student')),
  is_verified BOOLEAN DEFAULT FALSE,
  privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'alumni_only', 'private')),
  
  -- TIMESTAMPS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Experience table
CREATE TABLE work_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL means current job
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education table (for additional degrees)
CREATE TABLE education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_year INTEGER,
  end_year INTEGER,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX profiles_batch_year_idx ON profiles(batch_year);
CREATE INDEX profiles_privacy_level_idx ON profiles(privacy_level);
CREATE INDEX profiles_is_verified_idx ON profiles(is_verified);
CREATE INDEX profiles_location_idx ON profiles(current_city, current_country);
CREATE INDEX work_experiences_user_id_idx ON work_experiences(user_id);
CREATE INDEX education_user_id_idx ON education(user_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (privacy_level = 'public' AND is_verified = true);

CREATE POLICY "Alumni can view alumni_only profiles" ON profiles
  FOR SELECT USING (
    privacy_level = 'alumni_only' 
    AND is_verified = true 
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('alumni', 'admin')
    )
  );

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for work_experiences table
CREATE POLICY "Users can view their own work experiences" ON work_experiences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work experiences" ON work_experiences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work experiences" ON work_experiences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work experiences" ON work_experiences
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for education table
CREATE POLICY "Users can view their own education" ON education
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own education" ON education
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education" ON education
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education" ON education
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();