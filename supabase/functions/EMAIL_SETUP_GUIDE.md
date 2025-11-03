# Email Invitation Setup Guide

## Overview
This guide will help you set up email sending for alumni invitations using Resend (free tier: 100 emails/day).

---

## Step 1: Sign Up for Resend (FREE)

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with your email or GitHub account
3. Verify your email address

---

## Step 2: Get Your API Key

1. Log in to Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "SGBRMH Alumni Invitations")
5. Copy the API key (starts with `re_...`)
6. **SAVE THIS KEY - you can't view it again!**

---

## Step 3: Configure Domain (Optional but Recommended)

### Option A: Use Resend's Test Domain (Quick Start)
- You can send emails from `onboarding@resend.dev`
- Limited to your own email addresses
- Good for testing

### Option B: Add Your Own Domain (Production)
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `alumniconnect.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually 5-30 minutes)
6. Update the `from` field in `index.ts` to use your domain

---

## Step 4: Install Supabase CLI

### Windows (PowerShell):
```powershell
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# OR using npm
npm install -g supabase
```

### Verify installation:
```powershell
supabase --version
```

---

## Step 5: Link Your Supabase Project

```powershell
# Navigate to your project directory
cd c:\Users\Krishna\alumniconnect\sgbrmh-alumni-connect

# Login to Supabase (opens browser)
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your PROJECT_REF:**
1. Go to your Supabase dashboard
2. Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
3. Or go to Project Settings → General → Reference ID

---

## Step 6: Set Environment Variable (Resend API Key)

```powershell
# Set the secret in Supabase
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

---

## Step 7: Deploy the Edge Function

```powershell
# Deploy the function
supabase functions deploy send-invitation-email

# Verify deployment
supabase functions list
```

---

## Step 8: Update Email "From" Address (if using custom domain)

If you added your own domain to Resend:

1. Open `supabase/functions/send-invitation-email/index.ts`
2. Find line with: `from: 'SGBRMH Alumni <noreply@yourdomain.com>'`
3. Replace `yourdomain.com` with your actual domain
4. Redeploy: `supabase functions deploy send-invitation-email`

---

## Step 9: Test the Invitation Flow

1. Log in to your app as a verified user
2. Go to Alumni Directory
3. Click "Invite Batchmate"
4. Fill in the form with a real email (yours for testing)
5. Click "Send Invitation"
6. Check your email inbox (and spam folder)

---

## Troubleshooting

### Email not received?
- ✅ Check spam/junk folder
- ✅ Verify RESEND_API_KEY is set: `supabase secrets list`
- ✅ Check Edge Function logs: `supabase functions logs send-invitation-email`
- ✅ Make sure you're using the correct "from" domain

### Function deployment failed?
- ✅ Make sure you're logged in: `supabase login`
- ✅ Check project is linked: `supabase status`
- ✅ Verify file exists at correct path: `supabase/functions/send-invitation-email/index.ts`

### API Key issues?
- ✅ Make sure key starts with `re_`
- ✅ Regenerate key in Resend dashboard if needed
- ✅ Reset secret: `supabase secrets set RESEND_API_KEY=new_key`

---

## View Logs

```powershell
# Watch function logs in real-time
supabase functions logs send-invitation-email --tail

# View specific number of recent logs
supabase functions logs send-invitation-email -n 50
```

---

## Cost & Limits

### Resend Free Tier:
- ✅ 100 emails per day
- ✅ 3,000 emails per month
- ✅ Unlimited domains
- ✅ Full API access

### Supabase Edge Functions:
- ✅ 500K function invocations/month (free tier)
- ✅ 100 concurrent executions

**Both are FREE and perfect for your use case!**

---

## Alternative: Use Supabase Built-in SMTP (Not Recommended)

If you want to use Supabase's email service instead of Resend:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Configure SMTP settings
3. Modify the Edge Function to use Supabase's email API

**Note:** Resend is recommended because it's more reliable and has better deliverability.

---

## Summary of Commands

```powershell
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login and link project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 3. Set Resend API key
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# 4. Deploy function
supabase functions deploy send-invitation-email

# 5. Test and monitor
supabase functions logs send-invitation-email --tail
```

---

## Next Steps

After setting up email:
1. ✅ Test with your own email
2. ✅ Verify invitation link works
3. ✅ Check that registration pre-fills data
4. ✅ Deploy to production
5. ✅ Update Registration page to handle invite tokens

---

## Support

- Resend Docs: https://resend.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Check function logs for errors
