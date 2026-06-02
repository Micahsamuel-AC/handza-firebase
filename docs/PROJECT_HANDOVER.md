# HANDZA — Project Handover & AI Context

## Project Overview

HANDZA is Sri Lanka’s first on-demand labor marketplace platform.

It connects:

* Workers seeking flexible hourly income
* Employers needing trusted labor services quickly

Core idea:
"Connecting the right hands to the right work."

Like Uber or PickMe, but for physical labor services.

---

# Founder

* Micah Samuel
* University of Vavuniya
* Sri Lanka

---

# Live Platform

* Website: https://handzaf.vercel.app
* GitHub: https://github.com/Micahsamuel-AC/handza-firebase

---

# Tech Stack

* Next.js 14 (App Router)
* TypeScript
* Firebase Auth
* Firebase Firestore
* Firebase Storage
* Tailwind CSS
* Vercel Deployment
* Leaflet.js + OpenStreetMap

---

# Main User Types

## Workers

* Students (18+)
* Skilled laborers
* Tradespeople

Workers can:

* Create profile
* Upload NIC
* Toggle Available Now
* Apply for jobs
* Track work hours
* Earn flexible income

## Employers

* Homeowners
* SMEs
* Businesses

Employers can:

* Post jobs
* Find nearby workers
* Track worker timer
* Hire instantly

---

# Revenue Model

* 10% commission per completed job

Future:

* Premium listings
* Featured jobs
* Employer subscriptions

---

# Important Project Rules

1. Never expose worker phone/email before hiring
2. Always use Navbar component
3. Always use HANDZALogo component
4. Use useAuth() for auth state
5. Use useLang() for translations
6. Use existing design system colors/fonts
7. Do not hardcode Firebase keys
8. Keep App Router structure intact

---

# Core Colors

* Navy: #1B3A6B
* Orange: #E8541A
* Green: #10b981

---

# Important Collections

* profiles
* workerProfiles
* jobs
* applications
* messages
* notifications
* workSessions
* reviews
* reports

---

# Current Features

* Authentication
* Role switching
* Worker profiles
* Employer job posting
* Live map
* Hourly timer
* Admin dashboard
* Language system
* Messaging
* Notifications

---

# Deployment

Hosting:

* Vercel

Auto Deploy:

* Connected to GitHub main branch

---

# Important Commands

## Run locally

npm install

npm run dev

## Build production

npm run build

---

# Environment Variables

Stored in:
Vercel → Project Settings → Environment Variables

Never hardcode secrets.

---

# Future Roadmap

* Payment gateway
* Mobile app
* Worker certifications
* Insurance features
* Domain purchase
* More timer categories

---

# Notes For Future Development

Always:

* Fix one deployment issue at a time
* Test before pushing
* Keep components reusable
* Maintain clean folder structure
* Update documentation after major changes

---

Last Updated:
June 2026
