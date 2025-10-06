# Database Setup Guide

## 🚀 Quick Setup Instructions

### 1. Environment Variables Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Supabase credentials to `.env.local`:**
   ```env
   VITE_SUPABASE_URL=https://rrpekweatpjrkicuhaqn.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

   **⚠️ IMPORTANT:** Replace `your_actual_anon_key_here` with your real Supabase anon key from your Supabase dashboard.

### 2. Database Tables Setup

1. **Go to your Supabase Dashboard** → SQL Editor
2. **Run the setup script:** Copy and paste the contents of `database/setup.sql`
3. **Run the storage script:** Copy and paste the contents of `database/storage-setup.sql`

### 3. Security Verification

✅ **Verify these files are in `.gitignore`:**
- `.env.local` 
- `.env`
- `.env.*.local`

## 🗃️ Database Structure

### **Profiles Table** (Main user data)
```sql
profiles (
  id: UUID (Primary Key, references auth.users)
  email: TEXT (Unique, Required)
  full_name: TEXT (Required)
  batch_year: INTEGER (Required, 1970-2030)
  course: TEXT (Required)
  phone: TEXT (Required)
  avatar_url: TEXT (Optional)
  current_company: TEXT (Optional)
  current_position: TEXT (Optional)
  bio: TEXT (Optional)
  linkedin_url: TEXT (Optional)
  github_url: TEXT (Optional)
  website_url: TEXT (Optional)
  current_city: TEXT (Optional - for alumni map)
  current_country: TEXT (Optional - for alumni map)
  latitude: DECIMAL (Optional - for precise map location)
  longitude: DECIMAL (Optional - for precise map location)
  role: TEXT (Default: 'alumni', Options: 'admin'|'alumni'|'student')
  is_verified: BOOLEAN (Default: false)
  privacy_level: TEXT (Default: 'public', Options: 'public'|'alumni_only'|'private')
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

### **Work Experiences Table**
```sql
work_experiences (
  id: UUID (Primary Key)
  user_id: UUID (Foreign Key to profiles)
  company_name: TEXT (Required)
  position: TEXT (Required)
  start_date: DATE (Required)
  end_date: DATE (Optional - null means current job)
  description: TEXT (Optional)
  location: TEXT (Optional)
  created_at: TIMESTAMP
)
```

### **Education Table**
```sql
education (
  id: UUID (Primary Key)
  user_id: UUID (Foreign Key to profiles)
  institution: TEXT (Required)
  degree: TEXT (Required)
  field_of_study: TEXT (Optional)
  start_year: INTEGER (Optional)
  end_year: INTEGER (Optional)
  grade: TEXT (Optional)
  created_at: TIMESTAMP
)
```

## 📁 Storage Buckets

### **1. Avatars Bucket** (Public)
- **Purpose:** Profile pictures
- **Access:** Public read, authenticated upload
- **File Size Limit:** 2MB
- **Formats:** JPG, JPEG, PNG

### **2. Documents Bucket** (Private)
- **Purpose:** ID proofs, certificates
- **Access:** User can only access their own files
- **File Size Limit:** 5MB
- **Formats:** PDF, JPG, PNG

### **3. Gallery Bucket** (Public)
- **Purpose:** Event photos, hostel memories
- **Access:** Public read, authenticated upload
- **File Size Limit:** 10MB
- **Formats:** JPG, JPEG, PNG

## 🔐 Security Features

### **Row Level Security (RLS)**
- ✅ All tables have RLS enabled
- ✅ Users can only access their own data
- ✅ Public profiles are viewable by everyone
- ✅ Alumni-only profiles require authentication
- ✅ Storage buckets have proper access controls

### **Privacy Levels**
- **Public:** Visible to everyone (including non-users)
- **Alumni Only:** Visible only to verified alumni
- **Private:** Visible only to the user themselves

## 📊 Data Collection Strategy

### **Required During Signup:**
```typescript
{
  email: string;
  password: string;
  full_name: string;
  batch_year: number;
  course: string;
  phone: string;
}
```

### **Optional (Profile Completion):**
```typescript
{
  avatar_url?: string;
  current_company?: string;
  current_position?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  current_city?: string;    // For alumni map
  current_country?: string; // For alumni map
}
```

## 🌍 Alumni Map Integration

To display alumni on a world map, collect:
- `current_city` (Required for geocoding)
- `current_country` (Required for geocoding)
- `latitude` & `longitude` (Auto-filled via geocoding API)

## 🔄 Real-time Features

The setup includes:
- ✅ Automatic profile creation on user signup
- ✅ Real-time data synchronization across tabs
- ✅ Automatic timestamp updates
- ✅ Secure file uploads with automatic URL generation

## 🚨 Important Notes

1. **Never commit `.env.local`** - it's already in `.gitignore`
2. **Use environment variables** - never hardcode API keys
3. **Test RLS policies** - verify users can't access unauthorized data
4. **Set up storage limits** - monitor usage to stay within free tier
5. **Enable email confirmation** - set up in Supabase Auth settings

## 🧪 Testing the Setup

After setup, test:
1. User registration and login
2. Profile creation and updates
3. Image uploads
4. Privacy level enforcement
5. Real-time data sync across browser tabs