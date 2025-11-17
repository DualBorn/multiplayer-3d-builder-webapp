# Deployment Guide

This guide will help you deploy the Multiplayer 3D Builder to Vercel or Netlify.

## Prerequisites

- Your code pushed to a GitHub repository
- Supabase project set up and configured
- Environment variables ready

## Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Multiplayer 3D Builder"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **"New Project"**
4. Import your repository
5. Vercel will auto-detect Next.js settings
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **"Deploy"**
8. Wait for deployment to complete (~2-3 minutes)

### Step 3: Update Supabase Settings

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Redirect URLs**:
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app`
4. If using Google OAuth, update the redirect URI in Google Cloud Console:
   - `https://your-project-ref.supabase.co/auth/v1/callback`

### Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Try signing up/signing in
3. Test the 3D builder functionality
4. Open in multiple browser tabs to test multiplayer sync

## Deploy to Netlify

### Step 1: Push to GitHub (same as Vercel)

### Step 2: Deploy to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign in with your GitHub account
3. Click **"New site from Git"**
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Click **"Show advanced"** and add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **"Deploy site"**
8. Wait for deployment to complete

### Step 3: Update Supabase Settings

Same as Vercel Step 3, but use your Netlify URL instead.

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Supabase redirect URLs are updated
- [ ] Google OAuth redirect URI is updated (if using)
- [ ] Database tables are created (run `supabase/schema.sql`)
- [ ] Realtime is enabled for `scene_objects` table
- [ ] Test authentication (email/password and Google)
- [ ] Test multiplayer sync (open in multiple tabs)
- [ ] Test save/load functionality
- [ ] Test on mobile devices

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure Node.js version is 18+ in build settings
- Check build logs for specific errors

### Authentication Not Working

- Verify environment variables are set correctly
- Check Supabase redirect URLs match your deployment URL
- Ensure Google OAuth redirect URI is correct (if using)

### Real-time Not Working

- Verify Realtime is enabled in Supabase dashboard
- Check that `scene_objects` table has replication enabled
- Check browser console for WebSocket errors

### Database Errors

- Ensure you've run the SQL schema (`supabase/schema.sql`)
- Check that RLS policies are set up correctly
- Verify table names match exactly

## Custom Domain (Optional)

### Vercel

1. Go to your project settings
2. Click **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

### Netlify

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions


