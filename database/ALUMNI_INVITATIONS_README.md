# Alumni Invitations Feature Setup

## Overview
This feature allows verified alumni to invite their batchmates to join the platform.

## Database Setup

Run the following SQL script in your Supabase SQL Editor:

```bash
database/alumni-invitations-setup.sql
```

## Features Implemented

### 1. Invite Batchmate
- **Location**: Year Book page
- **Who can use**: Only logged-in and verified users
- **Button**: "Invite Batchmate" button appears in the header (visible only to verified users)

### 2. Invitation Process
1. User clicks "Invite Batchmate" button
2. Modal opens with form fields:
   - Full Name (required)
   - Email Address (required)
   - Batch Year (auto-filled if viewing a specific batch)
3. System validates:
   - Email format
   - Email not already registered
   - No duplicate invitations to same email
4. Invitation record created in database
5. Success message displayed

### 3. Login Redirect for Unregistered Users
- **Location**: Login page
- **Behavior**: When a user logs in with valid credentials but has no profile:
  - Shows welcome message
  - Automatically redirects to `/profile` page
  - User completes their profile
  - After profile completion, user can access the platform

## Database Schema

### alumni_invitations Table
```sql
- id: UUID (primary key)
- invited_by: UUID (foreign key to alumni table)
- invited_email: TEXT (unique)
- invited_name: TEXT
- batch_year: INTEGER
- status: TEXT ('pending', 'accepted', 'expired')
- invited_at: TIMESTAMP
- accepted_at: TIMESTAMP
```

## Row Level Security (RLS) Policies

1. **View own invitations**: Users can view invitations they sent
2. **Create invitations**: Only verified users can send invitations
3. **Update invitations**: Users can update their own invitations
4. **Admin access**: Admins can view all invitations

## Testing the Features

### Test Invite Batchmate:
1. Login as a verified user
2. Go to Year Book
3. Click "Invite Batchmate" button
4. Fill in name and email
5. Submit invitation
6. Verify success message appears

### Test Login Redirect:
1. Create a new auth user via Supabase (without alumni profile)
2. Try to login with those credentials
3. Verify redirect to profile creation page
4. Complete profile
5. Verify access to platform

## Future Enhancements (Optional)

1. **Email Integration**: Send actual invitation emails using a service like SendGrid or Resend
2. **Invitation Links**: Generate unique invitation links with pre-filled data
3. **Expiry**: Auto-expire invitations after X days
4. **Tracking**: Dashboard to view sent invitations and their status
5. **Bulk Invites**: Allow inviting multiple batchmates at once

## Files Modified

1. `src/pages/AlumniDirectory.tsx` - Added invite button and modal
2. `src/pages/auth/Login.tsx` - Added redirect to profile creation for users without profiles
3. `database/alumni-invitations-setup.sql` - Database table and RLS policies

## Notes

- Invitations are currently stored in the database but emails are not sent automatically
- To enable email sending, integrate with an email service provider
- The invitation status can be updated when the invited user accepts (registers)
