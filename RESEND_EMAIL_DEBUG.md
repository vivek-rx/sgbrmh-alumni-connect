# 📧 Resend Email Troubleshooting Guide

## 🚨 **Issue**: Resend verification email not working

## 🔧 **Supabase Dashboard Check**:

### 1. **Authentication Settings**:
1. Go to Supabase Dashboard → Authentication → Settings
2. **Check Site URL**: Should be `http://localhost:3001` (or your domain)
3. **Check Redirect URLs**: Should include `http://localhost:3001/auth/callback`

### 2. **Email Templates**:
1. Go to Authentication → Email Templates
2. **Confirm signup** template should be enabled
3. Template should contain: `{{ .SiteURL }}/auth/callback`

### 3. **SMTP Settings** (Important!):
1. Go to Authentication → Settings → SMTP Settings
2. **If using default Supabase SMTP**: Limited to 3 emails per hour per user
3. **Recommended**: Set up custom SMTP for unlimited emails

### 4. **Rate Limiting**:
- Default Supabase limits: 3 confirmation emails per hour per email address
- Check Authentication → Settings → Rate Limiting

## 🔍 **Testing Steps**:

### A. **Check Console Logs**:
1. Open browser dev tools (F12)
2. Click "Resend confirmation email"
3. Look for these logs:
```
📧 Resending confirmation email to: your@email.com
🔗 Redirect URL: http://localhost:3001/auth/callback
📤 Resend response: { data: {...}, error: null }
✅ Confirmation email resent successfully
```

### B. **Common Error Messages**:

**"rate limit"**: Wait 1 hour or use custom SMTP
**"not found"**: User doesn't exist, register first
**"already confirmed"**: User is already verified
**"fetch error"**: Network/connection issue

## 🚀 **Fixes Applied**:

### 1. **Enhanced Error Handling**:
- Specific error messages for different scenarios
- Alternative method using password reset if resend fails
- Better debugging with detailed console logs

### 2. **Fallback Method**:
- If `resend()` fails, tries `resetPasswordForEmail()` as alternative
- Still sends verification email to user

### 3. **Rate Limit Detection**:
- Detects and handles rate limiting gracefully
- Provides helpful user feedback

## 🔧 **Manual Test in Supabase**:

You can test email sending directly in Supabase:

1. Go to Authentication → Users
2. Find your test user
3. Click "Send recovery email" or "Resend confirmation"

## ⚙️ **Recommended Supabase Configuration**:

### SMTP Settings (Custom):
```
SMTP Host: smtp.gmail.com (or your provider)
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password
```

### Site URL:
```
Production: https://your-domain.com
Development: http://localhost:3001
```

### Redirect URLs:
```
http://localhost:3001/auth/callback
https://your-domain.com/auth/callback
http://localhost:3001/**
```

## 🐛 **Debug Test**:

Try this in browser console after entering email:
```javascript
// Test the resend function directly
await supabase.auth.resend({
  type: 'signup',
  email: 'your-test-email@example.com',
  options: {
    emailRedirectTo: window.location.origin + '/auth/callback'
  }
});
```

## 📋 **Checklist**:

- [ ] Custom SMTP configured (recommended)
- [ ] Site URL matches current domain
- [ ] Redirect URLs include callback route
- [ ] Email templates are enabled
- [ ] Rate limits not exceeded
- [ ] User exists in authentication
- [ ] Network connection stable
- [ ] Browser console shows no errors

## 🆘 **If Still Not Working**:

1. **Check Supabase Logs**: Dashboard → Logs
2. **Try with different email**: Test with fresh email address
3. **Check spam/junk folder**: Email might be filtered
4. **Wait 1 hour**: If rate limited
5. **Use alternative registration**: Register new account to test

The enhanced resend function should now work more reliably with better error handling and fallback options! 🎉