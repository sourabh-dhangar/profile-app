# Original User Request

## 2026-10-09T19:40:29Z

Build a full-stack personal digital identity and short-video profile platform (MyProfile) featuring a Reels-first feed, modular profile builder with dynamic sections, privacy-controlled mobile number discovery, public web profile viewer, and an admin moderation panel.

Working directory: e:\Job demoapp
Integrity mode: development

Reference: [Personal Digital Profile App - Revised Developer Product Brief & MVP Functional Specification v2](./IMPLEMENTATION_PLAN.md)

## Requirements

### R1. Backend REST API & Persistence (Node.js, Express, MongoDB)
- Implement user authentication with mobile number and OTP verification using a configurable provider adapter (mock/console in dev, pluggable SMS in prod).
- Provide CRUD APIs for user profiles and modular sections (About, Experience, Education, Skills, Services, Achievements, Contact, Social Links).
- Provide Reels APIs supporting metadata persistence, public feed pagination (cursor-based), and view counting.
- Enforce privacy rules with salted hash lookup for opt-in phone discovery (unlisted numbers must never be revealed or confirmed).
- Provide administrative endpoints for user management, reported content queue, and moderation takedowns.

### R2. Mobile Client Application (React Native with Expo)
- Build cross-platform mobile client using Expo managed workflow with React Navigation, expo-video/expo-av, and expo-camera.
- Reels-first home experience with vertical full-screen video swiping and guest browsing.
- Dedicated 'My Profile' bottom-tab dashboard displaying completion status, edit profile, and QR code sharing.
- Prominent '+' action for Reel creation with video capture/pick, trimming, cover selection, and audience visibility settings.
- Profile builder allowing adding/editing modular sections and live preview matching external visitors.
- Discovery screen for exact phone number lookup respecting the user's opt-in privacy setting.

### R3. Web Client Application (React.js)
- Responsive public web profile page (`/:username`) accessible in browsers without app installation.
- Administrative dashboard with metrics overview, user management, and moderation queue for reported profiles and reels.

### R4. Media Pipeline & Storage
- Cloudinary media integration for object storage, video transcoding, adaptive streaming, automatic thumbnail generation, and image compression with local dev fallback.
- Configurable upload limits for file size and reel duration.

### R5. Automated Verification Test Suites
- Comprehensive automated test suites (Jest/Supertest for backend API, React Testing Library for web components) verifying auth, profile CRUD, feed pagination, phone privacy lookup, and moderation.

## Acceptance Criteria

### Authentication & Core Profile
- [ ] Automated tests verify mobile OTP send and verify flow, returning JWT and profile status.
- [ ] Users can create, update, publish, and unpublish profiles with custom unique handles/slugs.
- [ ] Profile sections (Experience, Education, Skills, Services, Achievements) can be created, updated, and reordered.

### Reels Experience & Media
- [ ] App launches into a vertical-swipe Reels home feed where public videos load and play without requiring prior authentication.
- [ ] Authenticated profile owners can upload and publish reels linked to their profile ID with configurable visibility (public, profile-only, private).
- [ ] Automated tests verify view increment on reel playback.

### Web Viewer & Discovery
- [ ] Public profile route renders complete profile, dynamic sections, and published reels in standard web browsers.
- [ ] Phone discovery query returns profile preview if and only if `Allow Mobile Discovery` is enabled by owner; if disabled, returns 404 without leaking number registration status.
- [ ] Anti-enumeration rate limiting prevents rapid brute-force phone number lookups.

### Moderation & Administration
- [ ] Reporting a reel or profile enqueues it in the Admin moderation queue.
- [ ] Admin can review reported media and execute takedowns or user suspensions, which immediately reflect across feeds.
- [ ] Automated test suite runs green across all test suites via `npm test`.
