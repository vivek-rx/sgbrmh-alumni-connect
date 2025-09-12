# 🗄️ SGBRMH Alumni Network - Database Documentation

**PostgreSQL Database Schema for Alumni Network Platform**



This document provides comprehensive documentation for the SGBRMH Alumni Network database schema, including table structures, relationships, indexes, and usage guidelines. *


---

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Core Tables](#core-tables)
3. [Relationship Tables](#relationship-tables)
4. [Feature Tables](#feature-tables)
5. [System Tables](#system-tables)
6. [Indexes & Performance](#indexes--performance)
7. [Triggers & Functions](#triggers--functions)
8. [Row Level Security](#row-level-security)
9. [Sample Data](#sample-data)
10. [Usage Examples](#usage-examples)

---

## 🏗️ Database Overview

### **Database Engine**: PostgreSQL (via Supabase)
### **Version**: PostgreSQL 15+
### **Extensions Used**: 
- `uuid-ossp` - For UUID generation

### **Key Design Principles**:
- ✅ **Normalized Structure** - Separate tables for work experience and education
- ✅ **UUID Primary Keys** - Better for distributed systems and security
- ✅ **Proper Constraints** - Data validation at database level
- ✅ **Comprehensive Indexing** - Optimized for search and filtering
- ✅ **Audit Trail** - Created/updated timestamps on all tables
- ✅ **Soft Relationships** - CASCADE deletes where appropriate

---

## 👥 Core Tables

### **1. `alumni` - Main User Profiles**

**Purpose**: Central table storing all alumni/student information

```sql
CREATE TABLE alumni (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    batch_year INTEGER NOT NULL,
    profile_photo_url TEXT,
    phone VARCHAR(20),
    
    -- Personal Information
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    marital_status VARCHAR(30) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated', 'prefer_not_to_say')),
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
    role VARCHAR(50) DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni', 'student', 'guest')),
    verified BOOLEAN DEFAULT false,
    profile_completed BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Primary key | `f47ac10b-58cc-4372-a567-0e02b2c3d479` |
| `email` | VARCHAR(255) | Unique email address | `john.doe@example.com` |
| `name` | VARCHAR(255) | Full name | `John Doe` |
| `batch_year` | INTEGER | Graduation/batch year | `2020` |
| `profile_photo_url` | TEXT | Profile picture URL | `https://example.com/photo.jpg` |
| `phone` | VARCHAR(20) | Contact number | `+91-9876543210` |
| `gender` | VARCHAR(20) | Gender identity | `male`, `female`, `other` |
| `marital_status` | VARCHAR(30) | Marital status | `single`, `married`, etc. |
| `date_of_birth` | DATE | Birth date | `1998-05-15` |
| `age` | INTEGER | Age (auto-calculated) | `25` |
| `bio` | TEXT | Personal bio/description | `Software Engineer passionate about AI` |
| `whatsapp_number` | VARCHAR(20) | WhatsApp contact | `+91-9876543210` |
| `facebook_url` | TEXT | Facebook profile | `https://facebook.com/johndoe` |
| `instagram_url` | TEXT | Instagram profile | `https://instagram.com/johndoe` |
| `twitter_url` | TEXT | Twitter/X profile | `https://twitter.com/johndoe` |
| `linkedin_url` | TEXT | LinkedIn profile | `https://linkedin.com/in/johndoe` |
| `snapchat_url` | TEXT | Snapchat profile | `https://snapchat.com/add/johndoe` |
| `github_url` | TEXT | GitHub profile | `https://github.com/johndoe` |
| `portfolio_url` | TEXT | Personal website | `https://johndoe.dev` |
| `current_city` | VARCHAR(255) | Current location | `Pune` |
| `current_country` | VARCHAR(255) | Current country | `India` |
| `role` | VARCHAR(50) | User role | `admin`, `alumni`, `student`, `guest` |
| `verified` | BOOLEAN | Profile verification status | `true`, `false` |
| `profile_completed` | BOOLEAN | Profile completion flag | `true`, `false` |

### **2. `work_experience` - Professional History**

**Purpose**: Store multiple work experiences for each alumni

```sql
CREATE TABLE work_experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumni_id UUID REFERENCES alumni(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    location VARCHAR(255),
    employment_type VARCHAR(50) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `alumni_id` | UUID | Links to alumni table | Foreign key reference |
| `job_title` | VARCHAR(255) | Position title | `Senior Software Engineer` |
| `company_name` | VARCHAR(255) | Company name | `Google LLC` |
| `industry` | VARCHAR(255) | Industry sector | `Technology` |
| `start_date` | DATE | Employment start date | `2022-01-15` |
| `end_date` | DATE | Employment end date (NULL if current) | `2024-05-30` |
| `is_current` | BOOLEAN | Currently working here | `true`, `false` |
| `description` | TEXT | Role description | `Led a team of 5 engineers...` |
| `location` | VARCHAR(255) | Work location | `Bangalore, India` |
| `employment_type` | VARCHAR(50) | Type of employment | `full-time`, `internship`, etc. |

### **3. `education` - Educational Background**

**Purpose**: Store educational qualifications for each alumni

```sql
CREATE TABLE education (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumni_id UUID REFERENCES alumni(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_year INTEGER,
    end_year INTEGER,
    grade_cgpa VARCHAR(20),
    description TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `alumni_id` | UUID | Links to alumni table | Foreign key reference |
| `institution_name` | VARCHAR(255) | School/University name | `Pune University` |
| `degree` | VARCHAR(255) | Degree type | `Bachelor of Technology` |
| `field_of_study` | VARCHAR(255) | Major/specialization | `Computer Science Engineering` |
| `start_year` | INTEGER | Starting year | `2018` |
| `end_year` | INTEGER | Graduation year | `2022` |
| `grade_cgpa` | VARCHAR(20) | Grade/CGPA | `8.5/10`, `First Class` |
| `is_primary` | BOOLEAN | Primary degree from hostel institution | `true`, `false` |

---

## 🔗 Relationship Tables

### **4. `batches` - Batch Organization**

**Purpose**: Organize alumni by graduation years

```sql
CREATE TABLE batches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_year INTEGER UNIQUE NOT NULL,
    total_alumni INTEGER DEFAULT 0,
    description TEXT,
    batch_coordinator_id UUID REFERENCES alumni(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **5. `skills` & `alumni_skills` - Skills Management**

**Purpose**: Many-to-many relationship for alumni skills

```sql
-- Skills master table
CREATE TABLE skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100), -- 'technical', 'soft', 'industry'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alumni-Skills mapping
CREATE TABLE alumni_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alumni_id UUID REFERENCES alumni(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(alumni_id, skill_id)
);
```

---

## 🌟 Feature Tables

### **6. `mentorship` - Mentoring System**

**Purpose**: Track mentor-mentee relationships

```sql
CREATE TABLE mentorship (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES alumni(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES alumni(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined')),
    subject VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **7. `companies` - Company Directory**

**Purpose**: Standardized company information for dropdowns and search

```sql
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(255),
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🛡️ System Tables

### **8. `admin_actions` - Admin Activity Log**

**Purpose**: Track administrative actions for audit trail

```sql
CREATE TABLE admin_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES alumni(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(100),
    target_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## ⚡ Indexes & Performance

### **Primary Indexes**
```sql
-- Performance indexes for common queries
CREATE INDEX idx_alumni_batch_year ON alumni(batch_year);
CREATE INDEX idx_alumni_gender ON alumni(gender);
CREATE INDEX idx_alumni_marital_status ON alumni(marital_status);
CREATE INDEX idx_alumni_location ON alumni(current_city);
CREATE INDEX idx_alumni_verified ON alumni(verified);
CREATE INDEX idx_alumni_role ON alumni(role);

-- Work experience indexes
CREATE INDEX idx_work_experience_alumni_id ON work_experience(alumni_id);
CREATE INDEX idx_work_experience_company ON work_experience(company_name);
CREATE INDEX idx_work_experience_current ON work_experience(is_current);

-- Education indexes
CREATE INDEX idx_education_alumni_id ON education(alumni_id);
CREATE INDEX idx_education_institution ON education(institution_name);
CREATE INDEX idx_education_primary ON education(is_primary);
```

### **Query Optimization Tips**
- Use `batch_year` for filtering by graduation year
- Use `current_city` for location-based searches
- Use `company_name` in work_experience for company filtering
- Use `verified = true` to show only verified profiles

---

## 🔧 Triggers & Functions

### **1. Auto-Update Timestamps**
```sql
-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all relevant tables
CREATE TRIGGER update_alumni_updated_at BEFORE UPDATE ON alumni
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **2. Auto-Calculate Age**
```sql
-- Function to calculate age from date_of_birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update age
CREATE OR REPLACE FUNCTION update_age_from_dob()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_of_birth IS NOT NULL THEN
        NEW.age = calculate_age(NEW.date_of_birth);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alumni_age BEFORE INSERT OR UPDATE ON alumni
    FOR EACH ROW EXECUTE FUNCTION update_age_from_dob();
```

---

## 🔐 Row Level Security (RLS)

### **Security Policies**
```sql
-- Enable RLS on all tables
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Basic read policies (authentication handled by Clerk)
CREATE POLICY "Anyone can view alumni profiles" ON alumni
    FOR SELECT USING (true);

CREATE POLICY "Alumni can view all work experience" ON work_experience
    FOR SELECT USING (true);

CREATE POLICY "Alumni can view all education records" ON education
    FOR SELECT USING (true);
```

---

## 📊 Sample Data

### **Skills Data**
```sql
INSERT INTO skills (name, category) VALUES 
('JavaScript', 'technical'),
('React', 'technical'),
('Python', 'technical'),
('Data Science', 'technical'),
('Project Management', 'soft'),
('Leadership', 'soft'),
('Communication', 'soft'),
('Finance', 'industry'),
('Technology', 'industry');
```

### **Batch Data**
```sql
INSERT INTO batches (batch_year, description) VALUES 
(2018, '2018 Graduate Batch'),
(2019, '2019 Graduate Batch'),
(2020, '2020 Graduate Batch'),
(2021, '2021 Graduate Batch'),
(2022, '2022 Graduate Batch'),
(2023, '2023 Graduate Batch'),
(2024, '2024 Graduate Batch');
```

### **Companies Data**
```sql
INSERT INTO companies (name, industry) VALUES 
('Google LLC', 'Technology'),
('Microsoft Corporation', 'Technology'),
('Amazon', 'Technology'),
('Tata Consultancy Services', 'Technology'),
('Goldman Sachs', 'Finance'),
('McKinsey & Company', 'Consulting');
```

---

## 💡 Usage Examples

### **1. Get Complete Alumni Profile**
```sql
SELECT 
    a.*,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'job_title', we.job_title,
            'company_name', we.company_name,
            'start_date', we.start_date,
            'end_date', we.end_date,
            'is_current', we.is_current
        )
    ) as work_experience,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'institution_name', e.institution_name,
            'degree', e.degree,
            'field_of_study', e.field_of_study,
            'end_year', e.end_year
        )
    ) as education
FROM alumni a
LEFT JOIN work_experience we ON a.id = we.alumni_id
LEFT JOIN education e ON a.id = e.alumni_id
WHERE a.id = 'alumni-uuid-here'
GROUP BY a.id;
```

### **2. Search Alumni by Company**
```sql
SELECT DISTINCT a.name, a.batch_year, a.current_city, we.company_name, we.job_title
FROM alumni a
JOIN work_experience we ON a.id = we.alumni_id
WHERE LOWER(we.company_name) LIKE LOWER('%google%')
AND a.verified = true
ORDER BY a.batch_year DESC;
```

### **3. Find Alumni by Skills**
```sql
SELECT a.name, a.batch_year, s.name as skill_name, als.proficiency_level
FROM alumni a
JOIN alumni_skills als ON a.id = als.alumni_id
JOIN skills s ON als.skill_id = s.id
WHERE s.name IN ('JavaScript', 'React', 'Python')
AND als.proficiency_level >= 4
ORDER BY a.batch_year DESC;
```

### **4. Get Batch Statistics**
```sql
SELECT 
    batch_year,
    COUNT(*) as total_alumni,
    COUNT(CASE WHEN verified = true THEN 1 END) as verified_alumni,
    COUNT(CASE WHEN profile_completed = true THEN 1 END) as completed_profiles
FROM alumni
GROUP BY batch_year
ORDER BY batch_year DESC;
```

### **5. Alumni by Location**
```sql
SELECT 
    current_city,
    current_country,
    COUNT(*) as alumni_count
FROM alumni
WHERE current_city IS NOT NULL 
AND verified = true
GROUP BY current_city, current_country
ORDER BY alumni_count DESC
LIMIT 10;
```

---

## 🚀 Database Maintenance

### **Regular Maintenance Tasks**

1. **Update Statistics**
   ```sql
   ANALYZE alumni;
   ANALYZE work_experience;
   ANALYZE education;
   ```

2. **Check Index Usage**
   ```sql
   SELECT schemaname, tablename, attname, n_distinct, correlation
   FROM pg_stats
   WHERE tablename IN ('alumni', 'work_experience', 'education');
   ```

3. **Monitor Table Sizes**
   ```sql
   SELECT 
       schemaname,
       tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
   FROM pg_tables 
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

---

## 🔄 Migration Guide

### **Adding New Columns**
```sql
-- Example: Adding new social media field
ALTER TABLE alumni ADD COLUMN youtube_url TEXT;

-- Update existing records if needed
UPDATE alumni SET youtube_url = NULL WHERE youtube_url IS NULL;
```

### **Modifying Existing Columns**
```sql
-- Example: Increasing varchar length
ALTER TABLE alumni ALTER COLUMN bio TYPE TEXT;

-- Adding new constraint
ALTER TABLE work_experience ADD CONSTRAINT check_start_before_end 
    CHECK (end_date IS NULL OR start_date <= end_date);
```

---

## 📋 Best Practices

### **Data Integrity**
- Always use foreign key constraints
- Add CHECK constraints for enum-like values
- Use NOT NULL where appropriate
- Implement proper data validation

### **Performance**
- Index frequently queried columns
- Use EXPLAIN ANALYZE to optimize queries
- Consider partial indexes for filtered queries
- Monitor query performance regularly

### **Security**
- Enable RLS on all user tables
- Use proper authentication (Clerk integration)
- Sanitize all user inputs
- Regular security audits

---

## 🆘 Troubleshooting

### **Common Issues**

1. **UUID Generation Error**
   ```sql
   -- Ensure extension is enabled
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **Age Not Updating**
   ```sql
   -- Manually trigger age update
   UPDATE alumni SET date_of_birth = date_of_birth WHERE date_of_birth IS NOT NULL;
   ```

3. **Performance Issues**
   ```sql
   -- Check missing indexes
   SELECT schemaname, tablename, attname, n_distinct
   FROM pg_stats
   WHERE schemaname = 'public' AND n_distinct > 100;
   ```

---

**Database Schema Version**: 1.0.0  
**Last Updated**: September 13, 2025  
**Compatible with**: PostgreSQL 15+, Supabase

---
*This documentation is maintained alongside the database schema. For updates or questions, please refer to the main project repository.*
*The doc is generated by claude  :<*