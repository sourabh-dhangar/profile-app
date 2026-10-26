# MyProfile — Full-Stack Digital Identity & Video Portfolio Platform

[![E2E Test Suite](https://img.shields.io/badge/tests-241%20passed-brightgreen.svg)](tests-e2e/run-all.js)
[![Node.js](https://img.shields.io/badge/node->=20.0.0-blue.svg)](package.json)
[![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)](frontend/package.json)
[![Expo / React Native](https://img.shields.io/badge/expo-50.0.17-000020.svg)](mobile-app/package.json)
[![MongoDB](https://img.shields.io/badge/mongodb-7.0-47A248.svg)](backend/src/models/)

A comprehensive digital identity, dynamic portfolio, and vertical short-video platform engineered with the **MERN Stack** (MongoDB Atlas, Express.js, React 18, Node.js 20) and **React Native / Expo**.

---

## 🌐 Live Production Deployments

Component | Platform | URL
:--- | :--- | :---
**Web Application (Frontend)** | Vercel Global Edge | [https://myprofile-official-web.vercel.app](https://myprofile-official-web.vercel.app)
**Backend API Gateway** | Vercel Serverless / Node | [https://myprofile-official-api.vercel.app](https://myprofile-official-api.vercel.app)
**Mobile App (Web Preview)** | Vercel Global Edge | [https://mobile-app-alpha.vercel.app](https://mobile-app-alpha.vercel.app)
**Android Standalone APK (v1.0)** | Expo EAS Artifacts | [Download Standalone APK](https://expo.dev/artifacts/eas/7KqmaUUROgg8JVlUPOSqTskBjQ_1B1WkpjkWF2nu6Jw.apk)

---

## 🎯 Product Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Client Applications    │
                                  ├──────────────┬──────────────┤
                                  │  Web (Vite)  │ Mobile (Expo)│
                                  └──────┬───────┴──────┬───────┘
                                         │              │
                                         ▼              ▼
                         ┌──────────────────────────────────────────────┐
                         │      MyProfile Backend API Gateway           │
                         │    (Node.js 20, Express, JWT, Helmet)        │
                         ├──────────────────────────────────────────────┤
                         │  • /api/v1/auth         • /api/v1/profiles   │
                         │  • /api/v1/reels        • /api/v1/sections   │
                         │  • /api/v1/discovery    • /api/v1/chat       │
                         │  • /api/v1/ai           • /api/v1/admin      │
                         └──────────────────────┬───────────────────────┘
                                                │
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │          Cloud Data Persistence              │
                         │    MongoDB Atlas (Replica Set v7.0)          │
                         │  • 14 Indexed Collections with TTL / Unique  │
                         └──────────────────────────────────────────────┘
```

---

## ✨ Key Feature Highlights

1. **Reels-First Launch Screen**:
   - Immersive 60s vertical video feed with smooth swipe-up/down looping.
   - Offline-resilient media fallback, audio controls, likes, shares, and interactive comments.
   - Dual-tier: Guests browse seamlessly without forced authentication.

2. **Modular Digital Profile & Portfolio**:
   - Fully customizable sections: *About, Experience, Education, Projects, Skills, Services, Products, Contact*.
   - 5 curated visual themes: *Default Emerald Slate, Dark Neon, Minimalist Luxe, Cyberpunk Emerald, Sunset Gradient*.
   - Instant vCard (.vcf) contact export and high-res dynamic QR Code generator.
   - Direct visitor inquiries with real-time creator dashboard management.

3. **Universal Discovery & Direct Search**:
   - Real-time creator search by category (IT, Beauty, Creators, Business, etc.).
   - Privacy-first phone discovery: opt-in mobile search using zero-knowledge HMAC matching.

4. **1-on-1 Direct Messaging & Chat**:
   - In-app threaded conversations with unread counter, read receipts, and user discovery.

5. **AI Assistant**:
   - Smart bio and reel caption generation with pre-configured tone patterns.

6. **Admin Moderation Portal**:
   - Content moderation queue, report audit trail, user bans, and platform analytics.

---

## 📁 Repository Structure

```
.
├── backend/                  # Node.js + Express REST API Gateway
│   ├── src/controllers/      # Auth, Profile, Reels, Discovery, Chat, AI, Admin
│   ├── src/models/           # 14 Mongoose Schema Definitions with Indexes
│   ├── src/routes/           # Versioned API routes (/api/v1/*)
│   ├── src/middleware/       # Auth guards, Rate limiters, Error handler
│   ├── Dockerfile            # Container build specification
│   └── .env.example          # Environment variables template
├── frontend/                 # React 18 + Vite Web Application & Admin
│   ├── src/components/       # Reusable UI component library & themes
│   ├── src/pages/            # Landing, Profile, Dashboard, Explore, Admin
│   ├── Dockerfile            # Multi-stage production Nginx container
│   └── .env.example          # Web environment variables template
├── mobile-app/               # React Native / Expo Mobile Client
│   ├── src/screens/          # ReelsScreen, ProfileScreen, ExploreScreen, ChatScreen
│   ├── src/components/       # ReelCreatorModal, QRViewer, AudioPlayer
│   ├── eas.json              # EAS Build and OTA Update configurations
│   └── .env.example          # Mobile environment variables template
├── tests-e2e/                # Comprehensive 10-Tier Automated Test Suite
│   └── run-all.js            # Unified test runner (241 assertions)
├── scripts/                  # Utility scripts (Docker verify, DB migrations)
├── docker-compose.yml        # Full containerized stack orchestration
└── IMPLEMENTATION_PLAN.md    # Detailed client specification & architecture blueprint
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB (local `mongodb://localhost:27017` or MongoDB Atlas URI)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/sourabh-dhangar/profile-app.git
cd profile-app

# Install all sub-packages
npm --prefix backend install
npm --prefix frontend install
npm --prefix mobile-app install
```

### 2. Configure Environment Files
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

# Mobile App
cp mobile-app/.env.example mobile-app/.env
```

### 3. Run Development Servers
In separate terminal tabs:

```bash
# Tab 1: Backend API (runs on http://localhost:5000)
npm run backend

# Tab 2: Web Frontend (runs on http://localhost:5173)
npm run frontend

# Tab 3: Mobile App (Expo Metro bundler on http://localhost:8081)
npm run mobile
```

> **Developer Login Bypass:** For local testing, any phone number can request an OTP. The development OTP code is always `123456`.

---

## 🧪 Automated Testing & Quality Assurance

The codebase includes an exhaustive **10-tier automated E2E test suite** validating 241 critical paths across all layers:

```bash
npm test
```

### Test Suite Coverage:
- **Tier 1:** Full Feature Coverage (Auth, Profile, Sections, Reels, Discovery, Reports)
- **Tier 2:** Boundary, Corner Cases & Security Guards (Rate limiting, 401/403/404/409 checks)
- **Tier 3:** Cross-Feature Lifecycle Flows (Onboarding, Publishing, QR generation)
- **Tier 4:** Performance & Load Stress (Concurrent request bursts)
- **Tier 5:** Data Consistency & Cascade Deletions
- **Tier 6:** User Session Security & JWT Verification
- **Tier 7:** vCard RFC 6350 Specification Conformance
- **Tier 8:** Mobile Client API Parity & Inquiry Resolution
- **Tier 9:** Universal Business Category & Direct QR Discovery
- **Tier 10:** Direct 1-on-1 Chat & Messaging Threads

**Result:** `241 Passed, 0 Failed (100% Pass Rate)`.

---

## 🐳 Docker Deployment

The complete full-stack environment can be orchestrated with a single Docker Compose command:

```bash
# Validate Docker configurations
npm run verify:docker

# Launch container stack
docker compose --env-file .env.docker up -d --build
```

Services launched:
- `gateway`: Alpine Nginx reverse proxy routing `/api/*` to backend and `/*` to frontend.
- `backend`: Node.js 20 production container.
- `frontend`: Optimized static React build served via Nginx.
- `mongo`: MongoDB 7.0 database with persistent volume.
- `backup`: Automated daily database backup service.

---

## 📄 License & Client Handover

This project is developed and delivered for production deployment. All source code, assets, and documentation are ready for client handoff.
