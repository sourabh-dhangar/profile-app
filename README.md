# Personal Digital Profile App (MyProfile) — Project Workspace

A comprehensive digital identity and social profile platform built with the **MERN Stack** (MongoDB, Express, React, Node.js) and **React Native**.

> **Client Technical Document:** For the complete architecture diagrams, database schemas, API specs, and phased Gantt chart, see [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

---

## 📁 Repository Structure

```
Job demoapp/
├── backend/                  # Node.js + Express + MongoDB REST API & Media Microservices
│   └── README.md
├── frontend/                 # React.js Admin Moderation Panel & Public Web Profile Viewer
│   └── README.md
├── mobile-app/               # React Native (Android MVP, iOS Ready) Mobile Client
│   └── README.md
├── IMPLEMENTATION_PLAN.md    # Detailed client-ready blueprint & flow diagrams
└── WhatsApp Image *.jpeg     # Source requirement specification documents (v2)
```

---

## 🎯 Core Product Vision & Flow
- **One Person $\rightarrow$ One Profile $\rightarrow$ One Shareable Identity $\rightarrow$ Optional Reels & Social Engagement**
- **Reels-First Launch Screen**: Immediate vertical video feed on launch; guests can browse without forced registration.
- **My Profile Dashboard**: Bottom navigation tab leading to profile customization, dynamic sections, and QR code sharing.
- **Dedicated Reel Creator (`+`)**: Creators can publish short-form video content linked to their profile with audience privacy controls.
- **Browser-Accessible Web Profile**: External visitors can view public profiles without downloading the mobile app.
- **Dual Discovery & Phone Lookup**: Opt-in exact mobile search that protects private contact information.
- **Admin Moderation**: Centralized web dashboard for reviewing flagged content, takedowns, and account management.

---

## 🚀 Technology Stack
- **Database**: MongoDB (Atlas) + Mongoose ODM
- **Backend API**: Node.js, Express.js, JWT, Rate-limiters
- **Admin & Public Web**: React.js, Tailwind CSS, Vite
- **Mobile Application**: React Native (Android MVP, iOS Cross-Platform)
- **Media Delivery**: Object Storage (AWS S3 / Cloudinary) + CDN edge delivery
- **Auth & Verification**: Mobile Number + SMS OTP Gateway
