# Supabase Setup Guide

This guide walks you through the manual configuration steps needed to complete Phase 1 of the user account system.

## Prerequisites

- Supabase project created at: https://hezlnadpsbawzjlttjaq.supabase.co
- Environment variables configured in Cloudflare builders:
  - `REACT_APP_SUPABASE_URL=https://hezlnadpsbawzjlttjaq.supabase.co`
  - `REACT_APP_SUPABASE_ANON_KEY=sb_publishable_lzFruWYj3ep3m9Ge-CZJGA_h1EuWwds`

## Step 1: Run Database Migrations

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/hezlnadpsbawzjlttjaq
2. Navigate to **SQL Editor** in the left sidebar
3. Run the following migration files in order:

### Migration 1: Initial Schema
- Open `supabase/migrations/001_initial_schema.sql`
- Copy the entire contents
- Paste into SQL Editor and click **Run**
- Verify success: Check for tables `user_profiles`, `user_categories`, `user_datasources`, `category_shares`, `sync_metadata`

### Migration 2: Row Level Security Policies
- Open `supabase/migrations/002_rls_policies.sql`
- Copy the entire contents
- Paste into SQL Editor and click **Run**
- Verify success: Check that policies appear in **Authentication > Policies**

### Migration 3: Performance Indexes
- Open `supabase/migrations/003_indexes.sql`
- Copy the entire contents
- Paste into SQL Editor and click **Run**
- Verify success: No errors in the query result

## Step 2: Configure OAuth Providers

### Enable Google Authentication
1. Go to **Authentication > Providers** in Supabase dashboard
2. Find **Google** and click to enable
3. Follow Supabase's guide to:
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URIs
   - Copy Client ID and Client Secret to Supabase
4. Save configuration

### Enable GitHub Authentication
1. In the same **Authentication > Providers** section
2. Find **GitHub** and click to enable
3. Follow Supabase's guide to:
   - Create OAuth App in GitHub Developer Settings
   - Add callback URL: `https://hezlnadpsbawzjlttjaq.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase
4. Save configuration

## Step 3: Configure Email Settings

1. Go to **Authentication > Email Templates**
2. Customize the following templates (optional but recommended):
   - **Confirm Signup**: Email sent when users register
   - **Magic Link**: For passwordless login (if enabled)
   - **Reset Password**: Email for password recovery
   - **Email Change**: Confirmation when email is changed

3. Go to **Authentication > URL Configuration**
4. Set **Site URL** to your production domain (e.g., `https://game-datacards.com`)
5. Add redirect URLs for your staging/dev environments if needed

## Step 4: Verify Installation

Once all steps are complete, test the following:

### Test 1: User Registration
1. Open your deployed app
2. Click **Sign In** button in header
3. Click **Sign up** link
4. Fill out registration form
5. Verify email is sent
6. Check Supabase **Authentication > Users** to see the new user

### Test 2: Email Login
1. Sign in with email and password
2. Verify you see user menu with avatar in header
3. Check browser console for any errors

### Test 3: OAuth Login
1. Sign out
2. Click **Sign In**
3. Click **Sign in with Google**
4. Complete Google OAuth flow
5. Verify successful login

### Test 4: Database Access
1. While logged in, open browser DevTools > Application > Local Storage
2. Look for `supabase.auth.token`
3. Go to Supabase **SQL Editor**
4. Run test query:
```sql
SELECT * FROM user_profiles WHERE id = auth.uid();
```
5. Verify your profile row appears

## Step 5: Monitor and Debug

### Check Auth Logs
- Go to **Authentication > Logs** to see login attempts and errors

### Check Database Activity
- Go to **Database > Logs** for query performance and errors

### Test RLS Policies
- Try accessing another user's data (should fail)
- Verify you can only see your own categories/datasources

## Troubleshooting

### "relation does not exist" errors
- Migrations didn't run successfully
- Re-run migrations in order

### OAuth providers not working
- Check callback URLs match exactly
- Verify OAuth app is not in development mode
- Check Supabase logs for specific error messages

### Users can't sign up
- Check email settings in **Authentication > Email**
- Verify SMTP is configured or using Supabase's email service
- Check spam folder for confirmation emails

### RLS Policy errors
- Ensure all policies were created in migration 2
- Test with `auth.uid()` in SQL to verify user context

## Next Steps

After completing this setup, Phase 1 is fully operational. You can then:

1. **Deploy to production** and test with real users
2. **Begin Phase 2**: Implement subscription tiers with Polar.sh
3. **Add 2FA UI**: Enable users to set up two-factor authentication
4. **Monitor usage**: Track how many users sign up and which features they use

## Security Checklist

- [ ] Database migrations completed
- [ ] RLS policies active on all tables
- [ ] OAuth providers configured with valid credentials
- [ ] Site URL and redirect URLs configured
- [ ] Email templates reviewed
- [ ] Test user created successfully
- [ ] Verified users can only access their own data
- [ ] Anon key (not service role key) used in frontend
- [ ] Environment variables secured in Cloudflare builders
