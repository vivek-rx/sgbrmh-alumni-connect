-- =============================================
-- SGBRMH Alumni Network Database Schema
-- =============================================
-- Purpose: Store alumni information, enable networking, job sharing, and mentorship
-- Database: PostgreSQL (via Supabase)
-- Created: 13/09/2025
-- =============================================
-- Enable UUID extension for unique identifiers
-- Enable UUID extension
create extension IF not exists "uuid-ossp";

-- Users/Alumni Main Table
create table alumni (
  id UUID default uuid_generate_v4 () primary key,
  email VARCHAR(255) unique not null,
  name VARCHAR(255) not null,
  batch_year INTEGER not null,
  profile_photo_url TEXT,
  phone VARCHAR(20),
  -- Personal Information
  gender VARCHAR(20) check (
    gender in ('male', 'female', 'other', 'prefer_not_to_say')
  ),
  marital_status VARCHAR(30) check (
    marital_status in (
      'single',
      'married',
      'divorced',
      'widowed',
      'separated',
      'prefer_not_to_say'
    )
  ),
  date_of_birth DATE,
  age INTEGER,
  bio TEXT,
  -- Contact Information
  whatsapp_number VARCHAR(20),
  -- Social Media Links
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  snapchat_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  -- Location
  current_city VARCHAR(255),
  current_country VARCHAR(255),
  -- System Fields
  role VARCHAR(50) default 'alumni' check (role in ('admin', 'alumni', 'student', 'guest')),
  verified BOOLEAN default false,
  profile_completed BOOLEAN default false,
  last_active timestamp with time zone,
  created_at timestamp with time zone default NOW(),
  updated_at timestamp with time zone default NOW()
);

-- Work Experience Table
create table work_experience (
  id UUID default uuid_generate_v4 () primary key,
  alumni_id UUID references alumni (id) on delete CASCADE,
  job_title VARCHAR(255) not null,
  company_name VARCHAR(255) not null,
  industry VARCHAR(255),
  start_date DATE not null,
  end_date DATE,
  is_current BOOLEAN default false,
  description TEXT,
  location VARCHAR(255),
  employment_type VARCHAR(50) check (
    employment_type in (
      'full-time',
      'part-time',
      'contract',
      'internship',
      'freelance'
    )
  ),
  created_at timestamp with time zone default NOW(),
  updated_at timestamp with time zone default NOW()
);

-- Education Table
create table education (
  id UUID default uuid_generate_v4 () primary key,
  alumni_id UUID references alumni (id) on delete CASCADE,
  institution_name VARCHAR(255) not null,
  degree VARCHAR(255) not null,
  field_of_study VARCHAR(255),
  start_year INTEGER,
  end_year INTEGER,
  grade_cgpa VARCHAR(20),
  description TEXT,
  is_primary BOOLEAN default false, -- Mark the main degree from your institution
  created_at timestamp with time zone default NOW(),
  updated_at timestamp with time zone default NOW()
);

-- Batches Table (for organizing by year)
create table batches (
  id UUID default uuid_generate_v4 () primary key,
  batch_year INTEGER unique not null,
  total_alumni INTEGER default 0,
  description TEXT,
  batch_coordinator_id UUID references alumni (id),
  created_at timestamp with time zone default NOW()
);

-- Skills/Expertise Table (Many-to-Many)
create table skills (
  id UUID default uuid_generate_v4 () primary key,
  name VARCHAR(255) unique not null,
  category VARCHAR(100), -- 'technical', 'soft', 'industry'
  created_at timestamp with time zone default NOW()
);

create table alumni_skills (
  id UUID default uuid_generate_v4 () primary key,
  alumni_id UUID references alumni (id) on delete CASCADE,
  skill_id UUID references skills (id) on delete CASCADE,
  proficiency_level INTEGER check (proficiency_level between 1 and 5),
  created_at timestamp with time zone default NOW(),
  unique (alumni_id, skill_id)
);

-- Mentorship Table
create table mentorship (
  id UUID default uuid_generate_v4 () primary key,
  mentor_id UUID references alumni (id) on delete CASCADE,
  mentee_id UUID references alumni (id) on delete CASCADE,
  status VARCHAR(50) default 'pending' check (
    status in ('pending', 'active', 'completed', 'declined')
  ),
  subject VARCHAR(255), -- 'Career Guidance', 'Technical Skills', etc.
  description TEXT,
  created_at timestamp with time zone default NOW(),
  updated_at timestamp with time zone default NOW()
);

-- Job Postings Table (to be added)
-- Events Table (to be added)
-- Event Attendees (to be added)
-- Admin Actions Log
create table admin_actions (
  id UUID default uuid_generate_v4 () primary key,
  admin_id UUID references alumni (id) on delete CASCADE,
  action_type VARCHAR(100) not null, -- 'verify_user', 'delete_post', 'ban_user', etc.
  target_type VARCHAR(100), -- 'alumni', 'job_posting', 'event', etc.
  target_id UUID,
  description TEXT,
  created_at timestamp with time zone default NOW()
);

-- Create Indexes for Better Performance
create index idx_alumni_batch_year on alumni (batch_year);

create index idx_alumni_gender on alumni (gender);

create index idx_alumni_marital_status on alumni (marital_status);

create index idx_alumni_location on alumni (current_city);

create index idx_alumni_verified on alumni (verified);

create index idx_alumni_role on alumni (role);

create index idx_work_experience_alumni_id on work_experience (alumni_id);

create index idx_work_experience_company on work_experience (company_name);

create index idx_work_experience_current on work_experience (is_current);

create index idx_education_alumni_id on education (alumni_id);

create index idx_education_institution on education (institution_name);

create index idx_education_primary on education (is_primary);

-- Create updated_at trigger function
create or replace function update_updated_at_column () RETURNS TRIGGER as $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
create trigger update_alumni_updated_at BEFORE
update on alumni for EACH row
execute FUNCTION update_updated_at_column ();

create trigger update_work_experience_updated_at BEFORE
update on work_experience for EACH row
execute FUNCTION update_updated_at_column ();

create trigger update_education_updated_at BEFORE
update on education for EACH row
execute FUNCTION update_updated_at_column ();

create trigger update_mentorship_updated_at BEFORE
update on mentorship for EACH row
execute FUNCTION update_updated_at_column ();

-- Function to automatically calculate age from date_of_birth
create or replace function calculate_age (birth_date DATE) RETURNS INTEGER as $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update age when date_of_birth changes
create or replace function update_age_from_dob () RETURNS TRIGGER as $$
BEGIN
    IF NEW.date_of_birth IS NOT NULL THEN
        NEW.age = calculate_age(NEW.date_of_birth);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create trigger update_alumni_age BEFORE INSERT
or
update on alumni for EACH row
execute FUNCTION update_age_from_dob ();

-- Row Level Security (RLS) Policies for Supabase + Clerk Integration
alter table alumni ENABLE row LEVEL SECURITY;

alter table work_experience ENABLE row LEVEL SECURITY;

alter table education ENABLE row LEVEL SECURITY;

alter table batches ENABLE row LEVEL SECURITY;

alter table skills ENABLE row LEVEL SECURITY;

alter table alumni_skills ENABLE row LEVEL SECURITY;

alter table mentorship ENABLE row LEVEL SECURITY;

alter table admin_actions ENABLE row LEVEL SECURITY;

-- Basic RLS Policies (Note: With Clerk, we'll handle authentication in the API layer)
-- Alumni can read all profiles but only update their own
create policy "Anyone can view alumni profiles" on alumni for
select
  using (true);

-- Work experience policies
create policy "Alumni can view all work experience" on work_experience for
select
  using (true);

-- Education policies
create policy "Alumni can view all education records" on education for
select
  using (true);

-- Sample Data Insertion
insert into
  skills (name, category)
values
  ('JavaScript', 'technical'),
  ('React', 'technical'),
  ('Node.js', 'technical'),
  ('Python', 'technical'),
  ('Data Science', 'technical'),
  ('Machine Learning', 'technical'),
  ('AWS', 'technical'),
  ('Docker', 'technical'),
  ('Project Management', 'soft'),
  ('Leadership', 'soft'),
  ('Communication', 'soft'),
  ('Problem Solving', 'soft'),
  ('Finance', 'industry'),
  ('Healthcare', 'industry'),
  ('Education', 'industry'),
  ('Technology', 'industry');

-- Sample batch data
insert into
  batches (batch_year, description)
values
  (2018, '2018 Graduate Batch'),
  (2019, '2019 Graduate Batch'),
  (2020, '2020 Graduate Batch'),
  (2021, '2021 Graduate Batch'),
  (2022, '2022 Graduate Batch'),
  (2023, '2023 Graduate Batch'),
  (2024, '2024 Graduate Batch');

-- Sample companies for dropdown (you can create a separate table for this)
create table companies (
  id UUID default uuid_generate_v4 () primary key,
  name VARCHAR(255) unique not null,
  industry VARCHAR(255),
  website_url TEXT,
  created_at timestamp with time zone default NOW()
);

insert into
  companies (name, industry)
values
  ('Google LLC', 'Technology'),
  ('Microsoft Corporation', 'Technology'),
  ('Amazon', 'Technology'),
  ('Apple Inc.', 'Technology'),
  ('Meta (Facebook)', 'Technology'),
  ('Netflix', 'Technology'),
  ('Tesla', 'Automotive/Technology'),
  ('Goldman Sachs', 'Finance'),
  ('JPMorgan Chase', 'Finance'),
  ('McKinsey & Company', 'Consulting'),
  ('Deloitte', 'Consulting'),
  ('Tata Consultancy Services', 'Technology'),
  ('Infosys', 'Technology'),
  ('Wipro', 'Technology');