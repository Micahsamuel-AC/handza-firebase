# HANDZA — Complete Deployment Guide

## What's in this package
48 files — a complete Next.js 14 + Firebase app. Every page, component, and config is included and connected. No copy-paste errors.

## Step 1 — Delete old repo content (GitHub)
1. Go to your repo: github.com/Micahsamuel-AC/handza-firebase
2. Select ALL files and folders (app/, components/, lib/, public/, configs)
3. Delete them — commit the deletion

## Step 2 — Upload this entire folder
1. Drag the WHOLE `HANDZA_FINAL` folder contents into GitHub (or use GitHub Desktop / git push)
2. Keep the exact folder structure — app/, components/, lib/, public/locales/
3. Commit

## Step 3 — Set environment variables in Vercel
Go to Vercel → your project → Settings → Environment Variables. Add these 6:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCRZdrP6avpPuS6lnMfvteH6d1qOdq1nbg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=handza-2cd42.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=handza-2cd42
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=handza-2cd42.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=518578531415
NEXT_PUBLIC_FIREBASE_APP_ID=1:518578531415:web:926794f81723f59caf8712
```

## Step 4 — Redeploy
Vercel will auto-deploy after your GitHub push. Wait 60-90 seconds.

## Step 5 — Make yourself superadmin
1. Sign up on the live site
2. Firebase Console → Firestore → profiles → your document
3. Change `role` field to `superadmin`
4. Log out and back in — Admin Panel appears in navbar

## Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Storage Security Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /nic/{userId}/{allPaths=**} {
      allow read: if false;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## All Pages Included
- Public: Home, Jobs, Workers, Worker Profile, How it Works, About, Terms, Privacy
- Auth: Login, Signup (3-role)
- Worker: Dashboard, Profile, Work Timer
- Employer: Dashboard, Post Job, Find Workers Map, Employer Timer
- Job Detail: Apply, Accept/Reject applications
- Messages, Notifications
- Admin: Dashboard, Workers, Employers, Jobs, Verify Queue, Reports, Analytics, Team

## Features Included
✅ Dual-role accounts (Worker + Employer switch)
✅ Worker availability toggle with GPS
✅ Hourly payment timer (Cleaning, Household Help, Logistics) with 10% commission
✅ Privacy system — phone/email hidden until hired
✅ Leaflet + OpenStreetMap free map
✅ Language support (English / Sinhala / Tamil)
✅ Admin panel with NIC verification, suspend, reports, analytics, team access
✅ PDPA-compliant Terms & Privacy Policy

## Troubleshooting
- "Module not found '@/...'" → check tsconfig.json paths is included
- Map not showing → Leaflet loads via CDN script, needs internet
- "Firebase not initialized" → check all 6 env vars are set in Vercel
