# HANDZA — Deployment Guide

## Steps to Deploy

### 1. Upload to GitHub
- Go to your GitHub repo: github.com/Micahsamuel-AC/handza-firebase
- Delete the old `app/` and `components/` folders
- Upload everything from this zip

### 2. Set Environment Variables on Vercel
- Go to vercel.com → Your HANDZA project → Settings → Environment Variables
- Add all 6 variables from `.env.example` with your real Firebase values

### 3. Make yourself Super Admin
- After first login, go to Firebase Console
- Firestore → profiles → find your document
- Change `role` field to `"superadmin"`
- Now you can access /admin/dashboard

### 4. Set Firebase Storage Rules
In Firebase Console → Storage → Rules:
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

### 5. Set Firestore Security Rules
In Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /jobs/{jobId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    match /applications/{appId} {
      allow read, write: if request.auth != null;
    }
    match /messages/{msgId} {
      allow read, write: if request.auth != null;
    }
    match /conversations/{convId} {
      allow read, write: if request.auth != null;
    }
    match /notifications/{notifId} {
      allow read, write: if request.auth != null;
    }
    match /workerProfiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /reports/{reportId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Pages included
- / — Homepage
- /auth/login — Login
- /auth/signup — Signup (worker/employer)
- /dashboard — Role-aware dashboard
- /profile — Edit profile + NIC upload
- /workers — Browse workers
- /jobs — Browse jobs
- /jobs/[id] — Job detail + apply
- /jobs/new — Post a job (employer)
- /messages — Real-time messaging
- /notifications — Notifications
- /how-it-works — How it works
- /about — About HANDZA
- /legal/terms — Terms & Conditions
- /legal/privacy — Privacy Policy
- /admin/dashboard — Admin overview
- /admin/workers — Manage workers
- /admin/employers — Manage employers
- /admin/jobs — Manage jobs
- /admin/verify — NIC verification queue
- /admin/reports — Abuse reports
- /admin/analytics — Platform analytics
- /admin/team — Team access (superadmin)
