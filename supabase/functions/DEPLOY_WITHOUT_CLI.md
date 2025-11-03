# Deploy Without CLI - Using Supabase Dashboard

## 🎯 Quick Deploy (No CLI Needed!)

### Step 1: Get Resend API Key
1. Sign up at https://resend.com/signup
2. Go to **API Keys** → **Create API Key**
3. Copy your key (starts with `re_...`)

---

### Step 2: Set Environment Variable in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Manage Secrets**
3. Add a new secret:
   - Name: `RESEND_API_KEY`
   - Value: `re_your_actual_key_here`
4. Click **Save**

---

### Step 3: Deploy Edge Function via Dashboard

1. In Supabase Dashboard, go to **Edge Functions**
2. Click **Create a new function**
3. Name it: `send-invitation-email`
4. Copy the entire code from `supabase/functions/send-invitation-email/index.ts`
5. Paste it into the editor
6. **Update line 40** with your email:
   ```typescript
   from: 'SGBRMH Alumni <noreply@yourdomain.com>',
   ```
   - Use `onboarding@resend.dev` for testing
   - Or use your verified domain from Resend
7. Click **Deploy Function**

---

### Step 4: Test It!

1. Go to your app (localhost or production)
2. Log in as a verified user
3. Go to Alumni Directory
4. Click "Invite Batchmate"
5. Enter email details
6. Check your email inbox (and spam folder)

---

## 📱 Complete Function Code

If you need to copy the full code, here it is:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { to, invitedName, inviterName, batchYear, inviteLink } = await req.json()

    // Validate required fields
    if (!to || !invitedName || !inviterName || !inviteLink) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SGBRMH Alumni <onboarding@resend.dev>', // CHANGE THIS!
        to: [to],
        subject: `${inviterName} invited you to join SGBRMH Alumni Connect`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Join SGBRMH Alumni Connect</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SGBRMH Alumni Connect</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">Hi ${invitedName}! 👋</h2>
                
                <p style="font-size: 16px; color: #555;">
                  <strong>${inviterName}</strong> from Batch ${batchYear} has invited you to join the 
                  <strong>SGBRMH Alumni Connect</strong> platform!
                </p>
                
                <p style="font-size: 16px; color: #555;">
                  Connect with fellow alumni, discover career opportunities, stay updated on events, 
                  and be part of our thriving alumni community.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteLink}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 15px 40px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-size: 18px; 
                            font-weight: bold;
                            display: inline-block;">
                    Accept Invitation & Register
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #777; text-align: center;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${inviteLink}" style="color: #667eea; word-break: break-all;">${inviteLink}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                  This invitation was sent by ${inviterName}. If you didn't expect this invitation, 
                  you can safely ignore this email.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const data = await res.json()

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
```

---

## 🐛 Troubleshooting

### Can't find Edge Functions in Dashboard?
- Make sure you're on a paid plan OR have enabled it in your project settings
- Go to: Project Settings → Add-ons → Enable Edge Functions

### Email not working?
1. Check Edge Function logs in Dashboard
2. Verify `RESEND_API_KEY` is set correctly
3. Make sure `from` email is correct:
   - Test: use `onboarding@resend.dev`
   - Production: use your verified domain

### Still having issues?
- View logs: Dashboard → Edge Functions → select function → Logs
- Test directly: Dashboard → Edge Functions → select function → Invoke

---

## ✅ Summary

**Without CLI, you can:**
1. ✅ Add secrets via Dashboard
2. ✅ Deploy function via Dashboard
3. ✅ Test and monitor via Dashboard
4. ✅ Everything works the same!

**Next:** Just follow the 4 steps above and you're done! 🎉
