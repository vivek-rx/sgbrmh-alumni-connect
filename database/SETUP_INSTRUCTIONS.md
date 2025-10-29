# Database Setup Guide for Jobs & Events

## 📋 Step-by-Step Instructions

### Option 1: Using Supabase Dashboard (Recommended - Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project: `sgbrmh-alumni-connect`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the SQL**
   - Open the file: `database/jobs-events-setup.sql`
   - Copy ALL the content (lines 1-351)
   - Paste into the SQL Editor

4. **Run the Query**
   - Click "RUN" button (or press Ctrl+Enter)
   - Wait for "Success. No rows returned" message

5. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - You should see 4 new tables:
     - ✅ `jobs`
     - ✅ `events`
     - ✅ `event_registrations`
     - ✅ `job_applications`

---

### Option 2: Using Supabase CLI

```bash
# Navigate to project directory
cd c:\Users\Krishna\alumniconnect\sgbrmh-alumni-connect

# Run the SQL file
supabase db push --file database/jobs-events-setup.sql
```

---

## 🗂️ Tables Created

### 1. **jobs** table
Stores all job postings from alumni

**Columns:**
- `id` - Unique job ID (UUID)
- `title` - Job title (e.g., "Senior Software Engineer")
- `company` - Company name
- `location` - Job location
- `type` - Job type (full-time, part-time, contract, internship)
- `salary_range` - Salary information
- `description` - Job description
- `requirements` - Array of requirements
- `posted_by` - User ID who posted the job
- `posted_date` - When job was posted
- `application_link` - URL to apply
- `is_active` - Whether job is still active

### 2. **events** table
Stores all alumni events

**Columns:**
- `id` - Unique event ID (UUID)
- `title` - Event title
- `description` - Event details
- `event_date` - Date of event
- `event_time` - Time of event
- `location` - Event location
- `event_type` - Type (meetup, workshop, webinar, conference, social, other)
- `max_attendees` - Maximum capacity
- `current_attendees` - Current registrations
- `organized_by` - User ID of organizer
- `image_url` - Event image
- `registration_link` - Registration URL
- `is_active` - Whether event is active

### 3. **job_applications** table
Tracks who applied to which jobs

**Columns:**
- `id` - Unique application ID
- `job_id` - Reference to job
- `alumni_id` - User who applied
- `applied_at` - Application timestamp
- `status` - Application status
- `notes` - Additional notes

**Important:** Prevents duplicate applications with UNIQUE constraint

### 4. **event_registrations** table
Tracks who registered for which events

**Columns:**
- `id` - Unique registration ID
- `event_id` - Reference to event
- `alumni_id` - User who registered
- `registered_at` - Registration timestamp
- `attendance_status` - Status (registered, attended, cancelled, no-show)

**Important:** Prevents duplicate registrations with UNIQUE constraint

---

## 🔒 Security Features (RLS Policies)

### Jobs Table Policies:
- ✅ Verified users can VIEW all active jobs
- ✅ Verified users can POST new jobs
- ✅ Users can UPDATE/DELETE their own jobs

### Events Table Policies:
- ✅ Verified users can VIEW all active events
- ✅ Verified users can CREATE events (admin-only enforced in frontend)
- ✅ Users can UPDATE/DELETE their own events

### Job Applications Policies:
- ✅ Users can view their own applications
- ✅ Job posters can view applications for their jobs
- ✅ Verified users can apply for jobs

### Event Registrations Policies:
- ✅ Users can view their own registrations
- ✅ Event organizers can view registrations for their events
- ✅ Verified users can register for events

---

## 🎯 Automatic Features

### Triggers Included:

1. **Auto-update timestamps**
   - Jobs and Events tables automatically update `updated_at` on changes

2. **Auto-increment attendees**
   - When someone registers for an event, `current_attendees` increments
   - When someone cancels, `current_attendees` decrements

3. **Prevent duplicates**
   - Can't apply to same job twice
   - Can't register for same event twice

---

## 📊 Sample Data

The SQL file includes sample data:
- 2 sample jobs (Software Engineer, Product Manager)
- 2 sample events (Alumni Meet, Career Workshop)

**Note:** Sample data only inserts if there are verified users in the database.

---

## ✅ Verification Steps

After running the SQL file, verify everything is set up correctly:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('jobs', 'events', 'job_applications', 'event_registrations');
```

Should return 4 rows.

### 2. Check Indexes
```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('jobs', 'events', 'job_applications', 'event_registrations');
```

Should return multiple indexes for performance.

### 3. Check RLS Policies
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('jobs', 'events', 'job_applications', 'event_registrations');
```

Should return multiple policies for security.

### 4. Check Triggers
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table IN ('jobs', 'events', 'event_registrations');
```

Should return update triggers.

---

## 🚨 Troubleshooting

### Error: "relation already exists"
**Solution:** Tables already exist. This is fine! The script uses `IF NOT EXISTS` so it won't fail.

### Error: "permission denied"
**Solution:** Make sure you're using the Supabase service role or have proper permissions.

### Error: "foreign key constraint fails"
**Solution:** Make sure the `alumni` table exists first (it should from your previous setup).

### No sample data appears
**Solution:** This is normal if you don't have any verified users yet. Sample data only inserts when verified users exist.

---

## 🔄 If You Need to Reset

To drop all tables and start fresh:

```sql
-- Drop tables in correct order (reverse of foreign key dependencies)
DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Then run the setup SQL again
```

---

## 📝 Next Steps After Setup

1. ✅ Run the SQL file in Supabase
2. ✅ Verify tables are created
3. ✅ Test the Jobs page at `/jobs`
4. ✅ Test the Events page at `/events`
5. ✅ Try posting a job as a verified user
6. ✅ Try creating an event as an admin
7. ✅ Test applying for jobs
8. ✅ Test registering for events

---

## 🎉 That's It!

Once you run the SQL file, your Jobs and Events pages will be fully functional with:
- ✅ Database tables created
- ✅ Security policies enabled
- ✅ Indexes for fast queries
- ✅ Automatic triggers working
- ✅ Sample data loaded (if possible)

**Your app is ready to use!** 🚀

