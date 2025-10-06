-- Create the alumni table with all the specified fields
create table public.alumni (
  id uuid not null default extensions.uuid_generate_v4 (),
  email character varying(255) not null,
  name character varying(255) not null,
  batch_year integer not null,
  profile_photo_url text null,
  phone character varying(20) null,
  gender character varying(20) null,
  marital_status character varying(30) null,
  date_of_birth date null,
  age integer null,
  bio text null,
  whatsapp_number character varying(20) null,
  facebook_url text null,
  instagram_url text null,
  twitter_url text null,
  linkedin_url text null,
  snapchat_url text null,
  github_url text null,
  portfolio_url text null,
  current_city character varying(255) null,
  current_country character varying(255) null,
  role character varying(50) null default 'alumni'::character varying,
  verified boolean null default false,
  profile_completed boolean null default false,
  last_active timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint alumni_pkey primary key (id),
  constraint alumni_email_key unique (email),
  constraint alumni_gender_check check (
    (
      (gender)::text = any (
        (
          array[
            'male'::character varying,
            'female'::character varying,
            'other'::character varying,
            'prefer_not_to_say'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint alumni_marital_status_check check (
    (
      (marital_status)::text = any (
        (
          array[
            'single'::character varying,
            'married'::character varying,
            'divorced'::character varying,
            'widowed'::character varying,
            'separated'::character varying,
            'prefer_not_to_say'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint alumni_role_check check (
    (
      (role)::text = any (
        (
          array[
            'admin'::character varying,
            'alumni'::character varying,
            'student'::character varying,
            'guest'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

-- Create indexes for better performance
create index IF not exists idx_alumni_batch_year on public.alumni using btree (batch_year) TABLESPACE pg_default;
create index IF not exists idx_alumni_gender on public.alumni using btree (gender) TABLESPACE pg_default;
create index IF not exists idx_alumni_marital_status on public.alumni using btree (marital_status) TABLESPACE pg_default;
create index IF not exists idx_alumni_location on public.alumni using btree (current_city) TABLESPACE pg_default;
create index IF not exists idx_alumni_verified on public.alumni using btree (verified) TABLESPACE pg_default;
create index IF not exists idx_alumni_role on public.alumni using btree (role) TABLESPACE pg_default;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate age from date_of_birth
CREATE OR REPLACE FUNCTION update_age_from_dob()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_of_birth IS NOT NULL THEN
        NEW.age = EXTRACT(YEAR FROM AGE(NEW.date_of_birth));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_alumni_updated_at 
    BEFORE UPDATE ON alumni 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alumni_age 
    BEFORE INSERT OR UPDATE ON alumni 
    FOR EACH ROW 
    EXECUTE FUNCTION update_age_from_dob();

-- Enable Row Level Security
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON alumni
    FOR SELECT USING (verified = true AND profile_completed = true);

CREATE POLICY "Users can view their own profile" ON alumni
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON alumni
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON alumni
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Storage buckets for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);