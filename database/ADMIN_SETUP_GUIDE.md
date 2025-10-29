# 🛡️ Admin Setup Guide - ABMECT Pune Alumni Connect

## Complete Admin Account Setup

### 📋 Overview
This guide will help you create a super admin account with complete control over the platform:
- **Email**: admin@abmectpune.edu.in
- **Password**: abmectpune@123
- **Role**: admin

---

## 🚀 Step-by-Step Setup

### Step 1: Create Admin in Supabase Authentication

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project

2. **Navigate to Authentication**
   - Click "Authentication" in the left sidebar
   - Click "Users" tab
   - Click "Add User" button (top right)

3. **Fill in Admin Details**
   ```
   Email: admin@abmectpune.edu.in
   Password: abmectpune@123
   Auto Confirm User: ✅ YES (check this box)
   ```

4. **Click "Create User"**
   - Supabase will generate a UUID for this user
   - **IMPORTANT**: Copy the UUID (you'll need it in the next step)
   - It will look like: `550e8400-e29b-41d4-a716-446655440000`

---

### Step 2: Run SQL to Setup Admin Profile & Permissions

1. **Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

2. **Copy and Paste This SQL**
   - Replace `YOUR_ADMIN_UUID_HERE` with the actual UUID from Step 1

```sql
-- ============================================
-- ADMIN SETUP - COMPLETE SCRIPT
-- ============================================

-- Step 1: Insert admin profile into alumni table
INSERT INTO public.alumni (
    id,
    email,
    full_name,
    batch,
    branch,
    phone,
    role,
    verified,
    profile_completed,
    created_at
)
VALUES (
    'YOUR_ADMIN_UUID_HERE', -- ⚠️ REPLACE WITH ACTUAL UUID FROM SUPABASE AUTH
    'admin@abmectpune.edu.in',
    'Admin - ABMECT Pune',
    '2024',
    'Administration',
    '1234567890',
    'admin',
    true,
    true,
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    verified = true,
    profile_completed = true,
    email = 'admin@abmectpune.edu.in',
    full_name = 'Admin - ABMECT Pune';

-- Step 2: Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.alumni;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.alumni;

-- Step 3: Create admin-friendly RLS policies for alumni table
CREATE POLICY "Users and admins can view profiles"
ON public.alumni FOR SELECT
TO authenticated
USING (
    id = auth.uid() 
    OR verified = true
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Users can update own profile, admins can update all"
ON public.alumni FOR UPDATE
TO authenticated
USING (
    id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can delete any user"
ON public.alumni FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Step 4: Admin override policies for Jobs table
CREATE POLICY "Admins can view all jobs"
ON public.jobs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can update any job"
ON public.jobs FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can delete any job"
ON public.jobs FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Step 5: Admin override policies for Events table
CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can update any event"
ON public.events FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can delete any event"
ON public.events FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Step 6: Admin can view all job applications
CREATE POLICY "Admins can view all job applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can manage job applications"
ON public.job_applications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Step 7: Admin can view all event registrations
CREATE POLICY "Admins can view all event registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can manage event registrations"
ON public.event_registrations FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Step 8: Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.alumni
        WHERE id = user_id
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;

-- Step 9: Grant full permissions
GRANT ALL ON public.alumni TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.job_applications TO authenticated;
GRANT ALL ON public.event_registrations TO authenticated;
```

3. **Click "RUN"** (or press Ctrl+Enter)
4. **Verify "Success" message** appears

---

### Step 3: Test Admin Login

1. **Go to your app**: http://localhost:5173 (or your deployed URL)
2. **Click "Login"**
3. **Enter credentials**:
   - Email: `admin@abmectpune.edu.in`
   - Password: `abmectpune@123`
4. **Click "Sign In"**
5. **You should be redirected to**: `/admin/dashboard`

---

## 🎯 Admin Dashboard Features

Once logged in as admin, you'll have access to:

### 📊 Overview Tab
- **Statistics Dashboard**
  - Total users
  - Verified users count
  - Total jobs posted
  - Total events
  - Recent signups (last 7 days)
  
- **Quick Actions**
  - Manage Users
  - Manage Jobs
  - Manage Events
  - View Platform

### 👥 Users Management Tab
- **View all registered users**
- **Search and filter users**
  - Search by name, email, batch, branch
  - Filter by verification status
- **User Actions**:
  - ✅ Verify/Unverify users
  - 🗑️ Delete users
  - View complete profile details

### 💼 Jobs Management Tab
- **View all job postings**
- **Search jobs** by title, company, location
- **Job Actions**:
  - ✅ Activate/Deactivate jobs
  - 🗑️ Delete job postings
  - ➕ Add new jobs
  - View who posted each job

### 📅 Events Management Tab
- **View all events**
- **Search events** by title, location
- **Event Actions**:
  - ✅ Activate/Deactivate events
  - 🗑️ Delete events
  - ➕ Create new events
  - View attendee counts
  - See event organizer

---

## 🔒 Admin Permissions

The admin role has **complete database access**:

✅ **Alumni Table**
- View all profiles (verified and unverified)
- Update any user profile
- Delete any user
- Change verification status
- Change user roles

✅ **Jobs Table**
- View all jobs (active and inactive)
- Edit any job posting
- Delete any job
- Activate/deactivate jobs
- View all job applications

✅ **Events Table**
- View all events
- Create new events
- Edit any event
- Delete any event
- Activate/deactivate events
- View all registrations

✅ **Applications & Registrations**
- View all job applications
- View all event registrations
- Manage application statuses
- Manage registration statuses

---

## 🎨 UI Features

### Beautiful Admin Interface
- **Clean, modern design** with gradient backgrounds
- **Responsive layout** - works on all devices
- **Smooth animations** with Framer Motion
- **Color-coded status badges**
  - Green: Active/Verified
  - Yellow: Pending/Unverified
  - Red: Inactive/Deleted
  - Purple: Admin role

### Quick Actions
- **One-click verification/unverification**
- **Instant activate/deactivate**
- **Confirmation dialogs** for destructive actions
- **Real-time updates** after each action
- **Toast notifications** for success/error feedback

### Search & Filter
- **Real-time search** as you type
- **Multiple filter options** for users
- **Instant results** with no page reload

---

## 🚨 Troubleshooting

### Issue: "Access denied" message
**Solution**: Make sure the admin SQL script ran successfully. Check that:
1. The UUID in the SQL matches the auth user UUID
2. The `role` field is set to `'admin'`
3. The `verified` field is set to `true`

### Issue: Redirects to home instead of admin dashboard
**Solution**: 
1. Check the alumni table: `SELECT * FROM alumni WHERE email = 'admin@abmectpune.edu.in'`
2. Verify `role = 'admin'`
3. Clear browser cache and cookies
4. Try logging out and logging in again

### Issue: Can't see some users/jobs/events
**Solution**: The RLS policies need to be updated. Re-run the admin setup SQL script.

### Issue: "Permission denied" when trying to delete
**Solution**: Make sure all GRANT statements ran successfully. You can run them again:
```sql
GRANT ALL ON public.alumni TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.events TO authenticated;
```

---

## 🔐 Security Best Practices

1. **Change the password** after first login
2. **Don't share admin credentials**
3. **Create separate admin accounts** for different administrators
4. **Regularly audit user actions** in Supabase logs
5. **Backup database** before making bulk changes
6. **Test on staging** before production changes

---

## 📝 Verify Admin Setup

Run this query to confirm admin is set up correctly:

```sql
SELECT 
    a.id,
    a.email,
    a.full_name,
    a.role,
    a.verified,
    a.profile_completed,
    u.email_confirmed_at
FROM public.alumni a
LEFT JOIN auth.users u ON u.id = a.id
WHERE a.email = 'admin@abmectpune.edu.in';
```

**Expected result:**
- ✅ `role` = 'admin'
- ✅ `verified` = true
- ✅ `profile_completed` = true
- ✅ `email_confirmed_at` is NOT null

---

## 🎉 You're All Set!

Your admin dashboard is now ready with:
- ✅ Complete user management
- ✅ Full job moderation
- ✅ Total event control
- ✅ Real-time statistics
- ✅ Beautiful, clean UI
- ✅ Secure role-based access
- ✅ One-click actions

**Admin Login URL**: http://localhost:5173/auth/login

**Email**: admin@abmectpune.edu.in  
**Password**: abmectpune@123

**Happy administering!** 🚀

