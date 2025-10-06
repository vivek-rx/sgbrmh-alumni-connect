# Complete Setup Guide for Alumni Connect

## 🚀 Quick Start

### 1. Environment Setup

1. Copy the `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Supabase credentials to `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 2. Database Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL from `database/complete-setup.sql`

### 3. Email Configuration (Important!)

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Configure your email templates:
   - **Confirm signup**: Enable email confirmation
   - **Magic Link**: Optional
   - **Change email**: Enable if needed

3. **SMTP Settings** (Recommended for production):
   - Go to **Authentication** > **Settings** > **SMTP Settings**
   - Configure with your email provider (Gmail, SendGrid, etc.)

### 4. Testing the Authentication Flow

The registration and login forms now have extensive debug logging! 

#### Debug Features:
- 🔐 Auth response logging
- 📊 Profile data insertion tracking
- ❌ Error handling with detailed messages
- 📧 Email verification status tracking

#### To test:

1. **Register a new user**:
   - Open browser dev tools (F12)
   - Go to Console tab
   - Fill out the registration form
   - Watch the detailed logs showing each step

2. **Check your email**:
   - Look for confirmation email from Supabase
   - Click the confirmation link

3. **Login**:
   - Use the email and password from registration
   - Check console for auth flow logs

## 🐛 Debugging Tips

### Console Logs to Watch For:

**During Registration:**
```
🔐 Auth Response: {user: {...}, session: {...}}
📊 Profile data being inserted: {name: "...", email: "..."}
✅ Profile created successfully!
```

**During Login:**
```
🔐 Login successful: user@example.com
📧 Email not confirmed. Please check your email.
👤 User profile found: {name: "...", role: "alumni"}
```

### Common Issues:

1. **Email not confirmed**: Check spam folder, click confirmation link
2. **Profile not found**: Make sure registration completed successfully
3. **Database errors**: Check RLS policies and user permissions

## 📧 Email Verification Flow

1. User registers → Email sent automatically
2. User clicks email link → Redirects to `/auth/callback`
3. Callback page processes verification
4. User redirected to appropriate page based on role

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 File Structure

```
src/
├── pages/auth/
│   ├── Register-new.tsx    # Registration with debug logging
│   ├── Login-new.tsx      # Login with email verification
│   └── Callback.tsx       # Email verification handler
├── lib/
│   └── supabase.ts       # Supabase client configuration
└── types/
    └── database.types.ts # Database type definitions
```

## 🚨 Important Notes

1. **Security**: Never commit your `.env.local` file to git
2. **Email**: Configure SMTP settings for production
3. **RLS**: Row Level Security is enabled - users can only access their own data
4. **Debug**: Remove debug logs before production deployment

## 🔍 Testing Checklist

- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Email settings configured
- [ ] Registration form working
- [ ] Email confirmation received
- [ ] Login successful after confirmation
- [ ] Profile data visible in database
- [ ] Console logs showing debug information

## 🆘 Troubleshooting

If you encounter issues:
1. Check browser console for detailed error logs
2. Verify environment variables are correct
3. Ensure database schema is properly created
4. Check Supabase email settings
5. Verify email confirmation status

The debug logs will help identify exactly where the process is failing!