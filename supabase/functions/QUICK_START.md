# Quick Setup - Email Invitations

## 🚀 Fast Track (5 minutes)

### 1. Get Resend API Key
```
1. Sign up: https://resend.com/signup
2. Go to API Keys → Create API Key
3. Copy the key (re_...)
```

### 2. Install & Setup Supabase CLI
```powershell
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Deploy
```powershell
# Set your Resend API key
supabase secrets set RESEND_API_KEY=re_your_actual_key_here

# Deploy the function
supabase functions deploy send-invitation-email
```

### 4. Update Domain (if you have one)
Edit `supabase/functions/send-invitation-email/index.ts` line 40:
```typescript
from: 'SGBRMH Alumni <noreply@YOUR-DOMAIN.com>',
```
Then redeploy:
```powershell
supabase functions deploy send-invitation-email
```

### 5. Test
- Invite yourself from the app
- Check your email (and spam folder)
- Watch logs: `supabase functions logs send-invitation-email --tail`

---

## 📋 Required Info

**Get your Supabase Project Ref:**
- Dashboard URL format: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or: Project Settings → General → Reference ID

**Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month
- FREE forever

---

## 🐛 Quick Troubleshooting

**No email received?**
```powershell
# Check if secret is set
supabase secrets list

# View function logs
supabase functions logs send-invitation-email -n 20
```

**Deployment fails?**
```powershell
# Verify you're linked
supabase status

# Try unlinking and relinking
supabase unlink
supabase link --project-ref YOUR_PROJECT_REF
```

---

See `EMAIL_SETUP_GUIDE.md` for detailed instructions.
