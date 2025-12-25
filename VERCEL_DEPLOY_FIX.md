# Vercel Deployment Guide

## Critical: Fix Blank Page Issue

The blank page on Vercel was caused by the auto-login feature blocking app load. This has been fixed.

## Steps to Deploy Successfully

### 1. Set Environment Variable in Vercel

Go to your Vercel project settings → Environment Variables and add:

```
VITE_API_BASE_URL=https://your-backend-app.onrender.com
```

Replace with your actual Render backend URL.

### 2. Redeploy

After setting the environment variable:
- Go to Vercel dashboard
- Redeploy the project
- OR push a new commit to trigger auto-deploy

### 3. Verify Backend CORS

Make sure your backend (on Render) has the Vercel URL in CORS allowlist:
- Already configured in `backend/src/server.js`
- Should include: `https://diet-habit-tracker-nne2.vercel.app`

### 4. Test

After deployment:
1. Open browser console (F12)
2. Visit your Vercel URL
3. Check for any errors
4. App should load even without backend connection

## What Was Fixed

- ✅ Removed `setLoading(true)` from auto-login (was blocking render)
- ✅ Auto-login now only runs on localhost (not Vercel)
- ✅ App loads immediately without waiting for backend
- ✅ Better error handling for failed API calls

## Need Help?

If still seeing blank page:
1. Check browser console for errors
2. Verify VITE_API_BASE_URL is set in Vercel
3. Check Vercel build logs for errors
