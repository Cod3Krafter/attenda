# Supabase Setup Guide for Attenda

This guide will walk you through setting up Supabase for your Attenda application.

## Step 1: Create a Supabase Project

1. **Go to [Supabase](https://supabase.com)**
   - Sign in or create an account

2. **Create a New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Fill in project details:
     - **Name**: `attenda` (or your preferred name)
     - **Database Password**: Choose a strong password (save this!)
     - **Region**: Choose closest to your users
     - **Pricing Plan**: Free tier is fine to start

3. **Wait for Project Setup**
   - Takes about 2 minutes to provision the database

## Step 2: Get Your Project Credentials

1. **Navigate to Project Settings**
   - Click the ⚙️ icon in the sidebar
   - Go to "API" section

2. **Copy Your Credentials**
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon/Public Key**: Long string starting with `eyJ...`

3. **Create `.env.local` File**
   ```bash
   # Copy the example file
   cp .env.local.example .env.local
   ```

4. **Add Your Credentials**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 3: Set Up the Database Schema

1. **Open SQL Editor**
   - In Supabase Dashboard, click "SQL Editor" in sidebar
   - Click "New Query"

2. **Run the Schema**
   - Copy the contents of `supabase/schema.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

3. **Verify Tables Created**
   - Go to "Table Editor" in sidebar
   - You should see 5 tables:
     - ✅ `organizers`
     - ✅ `events`
     - ✅ `gates`
     - ✅ `guests`
     - ✅ `scans`

## Step 4: Configure Authentication

1. **Enable Email Auth**
   - Go to "Authentication" → "Providers"
   - Ensure "Email" is enabled (should be by default)

2. **Email Templates** (Optional but Recommended)
   - Go to "Authentication" → "Email Templates"
   - Customize "Confirm Signup" email
   - Customize "Reset Password" email

3. **Auth Settings**
   - Go to "Authentication" → "Settings"
   - **Site URL**: `http://localhost:3000` (for dev)
   - **Redirect URLs**: Add `http://localhost:3000/**`

## Step 5: Test the Connection

Run this test to verify everything is working:

```bash
pnpm test
```

All 39 tests should pass! ✅

## Step 6: Optional - Configure Storage (for future use)

If you plan to store event images, QR codes, etc.:

1. **Create Storage Bucket**
   - Go to "Storage" in sidebar
   - Click "New Bucket"
   - Name: `event-assets`
   - Make it public if needed

## Database Schema Overview

### Tables Created

| Table | Purpose |
|-------|---------|
| `organizers` | Event organizers (linked to Supabase Auth users) |
| `events` | Events created by organizers |
| `gates` | Entry gates for events |
| `guests` | Guest lists for events |
| `scans` | Check-in/check-out scan records |

### Key Features

✅ **UUID Primary Keys** - Using `uuid_generate_v4()`
✅ **Foreign Keys** - Proper relationships with `ON DELETE CASCADE`
✅ **Indexes** - Optimized for common queries
✅ **Auto Timestamps** - `created_at` and `updated_at` triggers
✅ **Row Level Security** - Organizers can only access their own data
✅ **Constraints** - Email validation, status checks, etc.

### Security (Row Level Security)

The schema includes RLS policies that ensure:
- ✅ Organizers can only see/edit their own events
- ✅ Guests can view and RSVP to events (public)
- ✅ Only authenticated organizers can create events
- ✅ Scans are restricted to event organizers

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the entire schema.sql file
- Check the SQL Editor for any errors

### "permission denied" error
- Verify RLS policies are enabled
- Check that you're authenticated when testing

### Can't connect from app
- Verify `.env.local` has correct credentials
- Restart your dev server: `pnpm dev`

## Next Steps

Once Supabase is set up:

1. ✅ Test authentication (sign up/sign in)
2. ✅ Create Supabase repository implementations
3. ✅ Build API routes
4. ✅ Create UI components

---

## Useful Supabase Commands

```bash
# Test connection
node -e "const { createClient } = require('@supabase/supabase-js'); const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); console.log('Connected:', !!client);"

# View all tables
# Go to: Table Editor in Supabase Dashboard

# View RLS policies
# Go to: Authentication → Policies
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

---

Happy building! 🚀
