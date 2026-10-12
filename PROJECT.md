# Project: MyProfile Full-Stack Platform

## Architecture
The system consists of three decoupled application tiers and an independent test infrastructure:
- **Backend Service (`/backend`)**: Node.js & Express REST API with MongoDB persistence (Mongoose), JWT authentication with SMS OTP adapter, Cloudinary/local media pipeline, HMAC-SHA256 salted phone hash index, and administrative moderation engine.
- **Frontend Web Application (`/frontend`)**: React.js SPA (Vite) providing public browser profile viewing (`/:username`) and administrative moderation dashboard (`/admin`).
- **Mobile Client Application (`/mobile-app`)**: React Native with Expo managed workflow, React Navigation, video player (`expo-video`/`expo-av`), camera capture (`expo-camera`), Reels-first vertical swipe feed with guest browsing, modular profile dashboard, and discovery search.
- **E2E Testing Track**: Autonomous opaque-box verification test suite testing API endpoints, security invariants, web components, and edge cases.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Send Mobile OTP | Generate and dispatch 6-digit OTP with rate limiting | M1 | IMPLEMENTATION_PLAN §6.1 |
| 2 | Verify Mobile OTP | Validate OTP, upsert user, issue JWT session token | M1 | IMPLEMENTATION_PLAN §6.1 |
| 3 | Session Profile & Guard | Check JWT, return user role, enforce account status | M1 | IMPLEMENTATION_PLAN §6.1 |
| 4 | Create/Update Basic Profile | Set display name, bio, profileType, and city | M2 | IMPLEMENTATION_PLAN §5.2 |
| 5 | Claim Unique Username | Validate and claim unique handle/slug | M2 | IMPLEMENTATION_PLAN §6.2 |
| 6 | Upload Profile Photo | Upload avatar image with compression and CDN storage | M2 | IMPLEMENTATION_PLAN §6.2 |
| 7 | Toggle Publish Status | Transition profile between draft, published, unpublished | M2 | IMPLEMENTATION_PLAN §5.2 |
| 8 | Generate Profile QR Code | Generate dynamic QR code pointing to public web profile | M2 | IMPLEMENTATION_PLAN §6.2 |
| 9 | Contact Privacy Controls | Config showPhone, showEmail, showWhatsapp, allowDiscovery | M2 | IMPLEMENTATION_PLAN §6.2 |
| 10 | Add Profile Section | Create modular section (About, Experience, Education, etc.) | M2 | IMPLEMENTATION_PLAN §5.3 |
| 11 | Get Profile Sections | Retrieve ordered modular sections by sequence index | M2 | IMPLEMENTATION_PLAN §6.3 |
| 12 | Update Profile Section | Edit section title, content, and visibility | M2 | IMPLEMENTATION_PLAN §6.3 |
| 13 | Delete Profile Section | Remove section and normalize order indexes | M2 | IMPLEMENTATION_PLAN §6.3 |
| 14 | Batch Reorder Sections | Atomically reorder all section display indexes | M2 | IMPLEMENTATION_PLAN §6.3 |
| 15 | Media Storage Pipeline | Cloudinary adapter with local filesystem development fallback | M2 | IMPLEMENTATION_PLAN §5.5 |
| 16 | Pre-signed Upload URL | Generate upload URL/mediaKey for video files | M3 | IMPLEMENTATION_PLAN §6.4 |
| 17 | Confirm & Publish Reel | Persist reel metadata, enforce 60s max duration limit | M3 | IMPLEMENTATION_PLAN §6.4 |
| 18 | Reels Public Feed | Cursor-paginated vertical video feed for guest/auth users | M3 | IMPLEMENTATION_PLAN §6.4 |
| 19 | Creator My-Reels List | Retrieve creator's reels across all visibility levels | M3 | IMPLEMENTATION_PLAN §6.4 |
| 20 | Update Reel Visibility | Toggle visibility (public, profile-only, private) | M3 | IMPLEMENTATION_PLAN §6.4 |
| 21 | Delete / Archive Reel | Soft-delete or archive reel from feed and profile | M3 | IMPLEMENTATION_PLAN §6.4 |
| 22 | Atomic View Count Increment | Atomically record view playback with throttle | M3 | IMPLEMENTATION_PLAN §6.4 |
| 23 | Salted Phone Discovery | Exact phone lookup using HMAC-SHA256, 404 for unlisted | M3 | IMPLEMENTATION_PLAN §6.5 |
| 24 | Anti-Enumeration Limiter | Rate limit phone discovery queries (<5/min) | M3 | IMPLEMENTATION_PLAN §6.5 |
| 25 | Report Content | Flag profile or reel for administrative review | M3 | IMPLEMENTATION_PLAN §5.6 |
| 26 | Admin Moderation Queue | List reported items with media metadata and status filter | M3 | IMPLEMENTATION_PLAN §6.6 |
| 27 | Moderation Takedown & Ban | Instant content takedown and user account suspension | M3 | IMPLEMENTATION_PLAN §6.6 |
| 28 | Platform Metrics Overview | Summary stats (users, published profiles, reels, reports) | M3 | IMPLEMENTATION_PLAN §6.6 |
| 29 | Structured Audit Logging | Record admin moderation and state changes | M3 | IMPLEMENTATION_PLAN §6.6 |
| 30 | Public Web Profile Viewer | Browser route `/:username` rendering profile, sections, reels | M4 | IMPLEMENTATION_PLAN §8 |
| 31 | Admin Web Dashboard | React admin dashboard for metrics, moderation, and users | M4 | IMPLEMENTATION_PLAN §13 |
| 32 | Mobile Guest Reels Feed | Vertical full-screen swipe video feed on app launch | M5 | IMPLEMENTATION_PLAN §4.2 |
| 33 | Mobile My Profile Dashboard | Profile completion gauge, edit profile, and QR code sharing | M5 | IMPLEMENTATION_PLAN §4.4 |
| 34 | Mobile Reel Creator Modal | Prominent '+' creator modal with capture/pick, trim, cover | M5 | IMPLEMENTATION_PLAN §5.1 |
| 35 | Mobile Discovery Screen | Phone number search screen with privacy preview card | M5 | IMPLEMENTATION_PLAN §9.1 |
| 36 | Automated E2E Test Suite | 100% pass across Tiers 1-4 and Tier 5 adversarial coverage | M6 | ORIGINAL_REQUEST §R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Foundation & Auth | Express server setup, Mongoose models (User, Profile, Section, Reel, ProfileLookup, Report, AuditLog), OTP service, JWT auth middleware, session routes | none | IN_PROGRESS |
| M2 | Profile Builder, Sections & Media | Profile CRUD, username slugifier, photo upload, modular sections engine, reordering, QR code generator, Cloudinary & local storage adapter | M1 | PLANNED |
| M3 | Reels Engine, Discovery & Moderation | Reels upload confirm, cursor pagination feed, view increment, HMAC-SHA256 phone discovery, rate limiter, moderation queue, takedown/ban actions, audit log | M1, M2 | PLANNED |
| M4 | Web Client (Viewer & Admin) | React SPA (Vite): Public profile route `/:username` with dynamic sections & reels grid; Admin moderation dashboard with metrics, queue, and user management | M2, M3 | PLANNED |
| M5 | Mobile Client (Expo React Native) | Expo app: Reels-first vertical swipe feed (guest browsing), My Profile dashboard with completion gauge, '+' Reel creator modal, Phone discovery screen | M2, M3 | PLANNED |
| M6 | Final E2E Test Suite & Hardening | Run 100% of E2E test suite (Tiers 1-4), adversarial coverage hardening (Tier 5), full regression verification | M1, M2, M3, M4, M5, TEST_TRACK | PLANNED |

## Interface Contracts
### Auth API Contract
- `POST /api/auth/send-otp` -> `{ mobile: string, countryCode?: string }` => `{ success: true, message: string, expiresIn: number }`
- `POST /api/auth/verify-otp` -> `{ mobile: string, otp: string }` => `{ token: string, user: { id, mobile, role, accountStatus }, profileStatus: "new" | "existing" }`
- `GET /api/auth/me` [Bearer Token] => `{ user: { id, mobile, role, accountStatus }, profile: Object }`

### Profile & Sections API Contract
- `GET /api/profile/me` [Bearer Token] => `{ profile: Object }`
- `PUT /api/profile/basic` [Bearer Token] -> `{ name, profileType, bio, city }` => `{ success: true, profile: Object }`
- `PUT /api/profile/username` [Bearer Token] -> `{ username: string }` => `{ success: true, username: string }`
- `POST /api/profile/photo` [Bearer Token, Multipart] => `{ photoUrl: string }`
- `POST /api/profile/publish` [Bearer Token] -> `{ status: "published" | "unpublished" }` => `{ success: true, status: string }`
- `GET /api/profile/qr` [Bearer Token] => `{ qrCodeUrl: string, profileUrl: string }`
- `PUT /api/profile/privacy` [Bearer Token] -> `{ contactDetails: { showPhone, showEmail, showWhatsapp }, allowDiscovery }` => `{ success: true }`
- `GET /api/profile/sections` [Bearer Token] => `[ { id, type, title, content, order, visibility } ]`
- `POST /api/profile/sections` [Bearer Token] -> `{ type, title, content, visibility }` => `{ success: true, section: Object }`
- `PUT /api/profile/sections/:id` [Bearer Token] -> `{ title, content, visibility }` => `{ success: true, section: Object }`
- `DELETE /api/profile/sections/:id` [Bearer Token] => `{ success: true }`
- `PUT /api/profile/sections/reorder` [Bearer Token] -> `{ orderMapping: [ { id: string, order: number } ] }` => `{ success: true }`

### Reels API Contract
- `GET /api/reels/feed?cursor=&limit=` [Public / Optional Bearer] => `{ reels: [ { id, videoUrl, thumbnailUrl, caption, viewsCount, creator: { name, username, photoUrl } } ], nextCursor: string, hasMore: boolean }`
- `GET /api/reels/my-reels` [Bearer Token] => `{ reels: [ ReelObject ], total: number }`
- `POST /api/reels/upload-url` [Bearer Token] -> `{ fileType: string, fileSize: number }` => `{ uploadUrl: string, mediaKey: string }`
- `POST /api/reels/confirm` [Bearer Token] -> `{ mediaKey: string, caption?: string, durationSeconds: number, visibility: "public" | "profile-only" | "private", thumbnailUrl?: string }` => `{ success: true, reel: Object }`
- `POST /api/reels/:id/view` [Public] => `{ success: true, viewsCount: number }`
- `PUT /api/reels/:id/visibility` [Bearer Token] -> `{ visibility: string }` => `{ success: true, visibility: string }`
- `DELETE /api/reels/:id` [Bearer Token] => `{ success: true }`

### Discovery API Contract
- `POST /api/discovery/phone-lookup` [Rate limited: 5/min] -> `{ mobile: string }`:
  - If found and `allowDiscovery: true` => HTTP 200 `{ profile: { name, username, photoUrl, profileType, city } }` (Never reveals phone number)
  - If not found OR `allowDiscovery: false` => HTTP 404 `{ error: "No profile found with this number" }` (Identical response body, zero enumeration leakage)

### Public Web Viewer Contract
- `GET /api/public/profile/:username` [Public] => `{ profile: Object, sections: [ Section ], publicReels: [ Reel ] }` (Returns 404 if profile is draft or unpublished)

### Admin & Moderation API Contract
- `POST /api/reports` [Public or Bearer] -> `{ targetType: "profile" | "reel", targetId: string, reason: string }` => `{ success: true, reportId: string }`
- `GET /api/admin/metrics` [Admin Bearer] => `{ totalUsers, activeProfiles, publishedReels, pendingReports }`
- `GET /api/admin/reports?status=&page=&limit=` [Admin Bearer] => `{ reports: [ ReportObject ], total: number }`
- `PUT /api/admin/reports/:id/action` [Admin Bearer] -> `{ action: "takedown" | "suspension" | "dismiss", adminNotes?: string }` => `{ success: true, report: Object }`
- `GET /api/admin/users?search=&status=&page=&limit=` [Admin Bearer] => `{ users: [ UserObject ], total: number }`
- `PUT /api/admin/users/:id/status` [Admin Bearer] -> `{ accountStatus: "active" | "suspended" | "deactivated" }` => `{ success: true, user: Object }`

## Code Layout
```
e:\Job demoapp/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/ (db.js, env.js)
│   │   ├── models/ (User.js, Profile.js, Section.js, Reel.js, ProfileLookup.js, Report.js, AuditLog.js)
│   │   ├── controllers/ (auth.controller.js, profile.controller.js, section.controller.js, reel.controller.js, discovery.controller.js, public.controller.js, admin.controller.js)
│   │   ├── routes/ (auth.routes.js, profile.routes.js, reel.routes.js, discovery.routes.js, public.routes.js, admin.routes.js, index.js)
│   │   ├── middlewares/ (auth.middleware.js, rateLimiter.middleware.js, validate.middleware.js, error.middleware.js)
│   │   ├── services/ (otp.service.js, storage.service.js, audit.service.js)
│   │   └── utils/ (phoneHash.util.js, slugify.util.js, qr.util.js)
│   └── tests/ (auth.test.js, profile.test.js, section.test.js, reels.test.js, discovery.test.js, admin.test.js, setup.js)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── pages/ (PublicProfile.jsx, AdminDashboard.jsx, AdminLogin.jsx, NotFound.jsx)
│   │   ├── components/ (ProfileHeader.jsx, SectionList.jsx, ReelGrid.jsx, ReelPlayerModal.jsx, QRCodeModal.jsx, AdminReportsTable.jsx, AdminUsersTable.jsx, MetricsCards.jsx)
│   │   ├── services/ (api.js, auth.service.js)
│   │   └── styles/ (index.css)
│   └── tests/ (PublicProfile.test.jsx, AdminDashboard.test.jsx)
├── mobile-app/
│   ├── package.json
│   ├── app.json
│   ├── App.js
│   └── src/
│       ├── navigation/ (AppNavigator.js, BottomTabNavigator.js)
│       ├── screens/ (ReelsHomeScreen.js, MyProfileScreen.js, EditProfileScreen.js, PhoneDiscoveryScreen.js, LoginScreen.js, OtpScreen.js)
│       ├── components/ (ReelPlayerItem.js, ReelCreatorModal.js, ProfileCompletionGauge.js, SectionCard.js, QRCodeShareModal.js)
│       └── services/ (api.js, auth.js)
└── tests-e2e/ (Opaque-box E2E test runner, Tier 1-4 test suites)
```
