# 📧 Email Verification Troubleshooting Guide

## 🚨 **Current Issue**: Email verification fails after clicking confirmation link

## 🔧 **Steps to Fix**:

### 1. **Update Database RLS Policies** (CRITICAL)
Run this SQL in your Supabase SQL Editor:

```sql
-- Run database/fix-rls-policies.sql
-- This fixes overly restrictive policies
```

### 2. **Supabase Dashboard Configuration**

#### A. **Email Templates**:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. **Confirm signup** template should be enabled
3. **Confirm your signup** template should look like this:
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your account:</p>
   <p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Confirm your account</a></p>
   ```

#### B. **Site URL Configuration**:
1. Go to Authentication → URL Configuration
2. Set **Site URL** to: `http://localhost:3001` (or your production domain)
3. Add **Redirect URLs**:
   - `http://localhost:3001/auth/callback`
   - `http://localhost:3001/**` (for wildcard)

#### C. **SMTP Settings** (Optional but recommended):
1. Go to Authentication → Settings → SMTP Settings
2. Enable custom SMTP (recommended for production)

### 3. **Database Schema Check**

Ensure your `alumni` table exists with these columns:
```sql
-- Check if your table has these columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'alumni' 
ORDER BY ordinal_position;
```

Required columns:
- `id` (uuid, primary key)
- `email` (varchar, unique)
- `verified` (boolean, default false)
- `created_at` (timestamp)

### 4. **Test the Flow**

#### A. **Check Browser Console**:
1. Open browser dev tools (F12)
2. Go to Console tab
3. Register a new user
4. Check for debug logs

#### B. **Check Email**:
1. Look for confirmation email
2. Click the link
3. Should redirect to `/auth/callback`
4. Check console logs during callback

#### C. **Expected Console Logs**:
```
📧 Auth callback triggered
🌐 Full URL: http://localhost:3001/auth/callback?token_hash=...
🔑 Extracted tokens: { accessToken: true, refreshToken: true, type: "email" }
✅ Session set result: { data: {...}, error: null }
👤 User verified: <user-id>
✅ User verification status updated in database
```

### 5. **Common Issues & Solutions**

#### **Issue**: "No verification tokens found"
**Solution**: Check Supabase email template and site URL configuration

#### **Issue**: "Session error"
**Solution**: 
- Clear browser cookies/localStorage
- Check if tokens are properly extracted from URL
- Verify redirect URL matches Supabase configuration

#### **Issue**: "Database update failed"
**Solution**: Run the RLS policy fix SQL

#### **Issue**: "User not found after verification"
**Solution**: Check if user exists in `auth.users` table in Supabase

### 6. **Manual Verification Check**

You can manually verify a user in Supabase:

```sql
-- Check user in auth.users table
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'your-test-email@example.com';

-- Manually verify a user (if needed)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'your-test-email@example.com';

-- Check alumni table
SELECT id, email, verified, created_at 
FROM public.alumni 
WHERE email = 'your-test-email@example.com';
```

### 7. **Testing Checklist**

- [ ] RLS policies updated
- [ ] Site URL configured in Supabase
- [ ] Email template has correct callback URL
- [ ] User registration creates entry in `auth.users`
- [ ] User registration creates entry in `alumni` table
- [ ] Email confirmation link received
- [ ] Callback URL processes tokens correctly
- [ ] Database `verified` field updated
- [ ] User can log in after verification

## 🆘 **If Still Not Working**:

1. **Check Supabase logs**: Go to Dashboard → Logs
2. **Test with a fresh user**: Clear all data and try with new email
3. **Verify environment variables**: Ensure `.env.local` has correct values
4. **Check browser network tab**: Look for failed API requests

## 🎯 **Expected Final Result**:
After clicking email confirmation link:
- User redirected to `/auth/callback`
- Page shows "Email verified successfully!"
- User can log in normally
- `verified: true` in alumni table
- `email_confirmed_at` populated in auth.users table