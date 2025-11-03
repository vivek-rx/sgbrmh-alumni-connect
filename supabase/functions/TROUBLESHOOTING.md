# Fixing 500 Error - Edge Function Troubleshooting

## 🔍 Your Error:
```
Failed to load resource: the server responded with a status of 500
Edge Function returned a non-2xx status code
```

## ✅ I've Fixed the Code

Updated `supabase/functions/send-invitation-email/index.ts` with:
- ✅ Better error handling
- ✅ API key validation
- ✅ Console logging for debugging
- ✅ Changed email from to `onboarding@resend.dev` (Resend's test domain)

---

## 🔧 Now Do These Steps:

### Step 1: Verify RESEND_API_KEY is Set

1. Go to **Supabase Dashboard**
2. Navigate to **Project Settings** → **Edge Functions** → **Manage Secrets**
3. Check if `RESEND_API_KEY` exists
4. If not, add it:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (starts with `re_...`)

### Step 2: Re-Deploy the Function

Copy the ENTIRE updated code from `supabase/functions/send-invitation-email/index.ts` and:

1. Go to **Supabase Dashboard** → **Edge Functions**
2. Find `send-invitation-email` function
3. Click **Edit**
4. Replace ALL the code with the updated version
5. Click **Deploy**

### Step 3: Check the Logs

After deploying:
1. Go to **Edge Functions** → **send-invitation-email** → **Logs**
2. Try sending an invitation from your app
3. Watch the logs - you should see:
   - "Received request: ..."
   - "Sending email via Resend..."
   - "Email sent successfully: ..."

---

## 📋 Common Issues & Solutions:

### Issue 1: "RESEND_API_KEY is not set"
**Solution:** 
- Add the secret in Dashboard → Edge Functions → Manage Secrets
- Make sure it's named exactly: `RESEND_API_KEY`

### Issue 2: "Resend API error: API key is invalid"
**Solution:**
- Your Resend API key is wrong
- Get a new one from https://resend.com/api-keys
- Update the secret in Supabase

### Issue 3: "Resend API error: Invalid 'from' address"
**Solution:**
- The updated code uses `onboarding@resend.dev` (always works)
- If you added your own domain in Resend, change line 60 to:
  ```typescript
  from: 'SGBRMH Alumni <noreply@yourdomain.com>',
  ```

### Issue 4: Email goes to spam
**Solution:**
- This is normal for test emails
- Check spam folder
- In production, use a verified domain

---

## 🧪 How to Test:

### Test 1: Check if function is responding
In your browser console:
```javascript
const { data, error } = await supabase.functions.invoke('send-invitation-email', {
  body: {
    to: 'your-email@example.com',
    invitedName: 'Test User',
    inviterName: 'Your Name',
    batchYear: 2024,
    inviteLink: 'https://yourapp.com/register?invite=test123'
  }
});
console.log('Result:', data, error);
```

### Test 2: Send real invitation
1. Log in as verified user
2. Go to Alumni Directory
3. Click "Invite Batchmate"
4. Use YOUR email address
5. Check inbox (and spam)

---

## 📊 Expected Log Output:

**Success:**
```
Received request: { to: 'test@example.com', invitedName: 'John', inviterName: 'Jane', batchYear: 2024 }
Sending email via Resend...
Email sent successfully: { id: '...', ... }
```

**If API key missing:**
```
RESEND_API_KEY is not set
```

**If Resend error:**
```
Resend API error: [error details from Resend]
```

---

## 🎯 Action Items:

1. ✅ Verify `RESEND_API_KEY` secret is set
2. ✅ Re-deploy function with updated code
3. ✅ Check logs while testing
4. ✅ Send test invitation

---

## 💡 Still Not Working?

**Check these in order:**

1. **Supabase Dashboard** → Edge Functions → Logs
   - See exact error message

2. **Resend Dashboard** → Logs
   - See if request reached Resend

3. **Network Tab** (Browser DevTools)
   - Check the request payload
   - See the exact response

4. **Copy the error from logs** and let me know!

---

## 📧 Quick Resend Setup Reminder:

1. Sign up: https://resend.com/signup
2. Get API key: https://resend.com/api-keys
3. Use the test domain `onboarding@resend.dev` OR
4. Add your domain: https://resend.com/domains

**Free tier: 100 emails/day, 3,000/month**
