# HANDZA Firebase Setup Guide

## Step 1 — Create Firebase Project (Free)

1. Go to **https://console.firebase.google.com**
2. Click **"Create a project"**
3. Name it **handza** → click Continue
4. Disable Google Analytics (not needed) → click **Create project**
5. Wait ~30 seconds

---

## Step 2 — Enable Authentication

1. In left sidebar click **"Authentication"**
2. Click **"Get started"**
3. Click **"Email/Password"** → toggle **Enable** ON → Save ✅

---

## Step 3 — Create Firestore Database

1. In left sidebar click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** → Next
4. Choose region: **asia-southeast1 (Singapore)** → Enable ✅

---

## Step 4 — Set Firestore Rules

1. In Firestore, click **"Rules"** tab
2. Replace everything with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /workerProfiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /jobs/{jobId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.employerId;
    }
    match /applications/{appId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /messages/{msgId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || request.auth.uid == resource.data.receiverId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.receiverId;
    }
    match /notifications/{notifId} {
      allow read, update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click **Publish** ✅

---

## Step 5 — Get Your Config Keys

1. Click the **gear icon ⚙️** → **Project settings**
2. Scroll down to **"Your apps"**
3. Click the **</>** (Web) icon
4. Register app name: **handza-web** → click Register
5. Copy the `firebaseConfig` object — you need these values:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

---

## Step 6 — Add Keys to Your Project

1. In your project folder, rename `.env.local.example` to `.env.local`
2. Fill in your values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Step 7 — Deploy to Vercel

1. Push to GitHub
2. Go to vercel.com → Import repo
3. Add all 6 environment variables in Vercel settings
4. Click Deploy ✅

**Your site will be live in 2 minutes!**

---

## Firestore Collections (auto-created on first use)

| Collection | What it stores |
|-----------|---------------|
| `profiles` | All user profiles |
| `workerProfiles` | Worker skills, rate, availability |
| `jobs` | All job postings |
| `applications` | Job applications |
| `messages` | Chat messages |
| `notifications` | User notifications |
| `reviews` | Ratings and reviews |
