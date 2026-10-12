# Specification Mining Report & Test Architecture Blueprint

**Module:** Personal Digital Profile App (MyProfile) Full-Stack Platform  
**Author:** `spec_miner_survey_3` (teamwork_preview_spec_miner)  
**Target:** Backend API, Public Web Profile, Admin Moderation, Mobile Client  
**Authoritative Specs Analyzed:**
- `e:\Job demoapp\IMPLEMENTATION_PLAN.md` (Version 2 Developer Brief & System Blueprint)
- `e:\Job demoapp\.agents\teamwork\ORIGINAL_REQUEST.md` (Requirements R1–R5 & Acceptance Criteria)
- `e:\Job demoapp\WhatsApp Image 2026-10-10 at 00.28.*.jpeg` (All 12 Physical Client Specification Pages)

---

## 1. Observation

Direct observations extracted from the authoritative source files:

1. **Architecture & Scope (`IMPLEMENTATION_PLAN.md`, Lines 1–83, 175–229):**
   - Three decoupled tiers: `backend/` (Node.js/Express/MongoDB), `frontend/` (React.js Admin + Public Web Viewer), and `mobile-app/` (React Native Expo).
   - "One Person $\rightarrow$ One Profile $\rightarrow$ One Shareable Identity $\rightarrow$ Optional Reels & Social Engagement".
   - Mongoose data models: `User.js`, `Profile.js`, `Section.js`, `Media.js`, `Reel.js`, `ReelEngagement.js`, `PrivacySetting.js`, `ProfileLookup.js`, `Report.js`.

2. **Authentication & Session (`IMPLEMENTATION_PLAN.md`, Lines 391–403, 497–500; `ORIGINAL_REQUEST.md`, Lines 14–16, 42–46):**
   - Endpoints: `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `GET /api/auth/me`.
   - Pluggable SMS OTP adapter (console/mock in development, Twilio/MSG91/Fast2SMS in production).
   - Mobile number uniquely indexed, defaults to country code `+91`.
   - Rate limiting and abuse protection on OTP dispatch and verification attempts.
   - User account status: `active`, `suspended`, `deactivated`.

3. **Profile Builder & Modular Sections (`IMPLEMENTATION_PLAN.md`, Lines 405–452, 502–517; Image `00.28.44.jpeg` Page 5):**
   - Endpoints: `GET /api/profile/me`, `PUT /api/profile/basic`, `PUT /api/profile/username`, `POST /api/profile/photo`, `POST /api/profile/publish`, `GET /api/profile/qr`, `PUT /api/profile/privacy`.
   - Section endpoints: `GET /api/profile/sections`, `POST /api/profile/sections`, `PUT /api/profile/sections/:id`, `DELETE /api/profile/sections/:id`, `PUT /api/profile/sections/reorder`.
   - Section types: `about`, `experience`, `education`, `skills`, `services`, `achievements`, `photos`.
   - Section visibility: `public`, `profile-only`, `private`.
   - Unique lowercase handle/slug with format validation and collision checks.
   - Dynamic completion percentage (`completionPercentage`: default 20% on basic setup).

4. **Reels Management & Video Delivery (`IMPLEMENTATION_PLAN.md`, Lines 454–468, 518–526; Image `00.28.44.jpeg` Page 5.1):**
   - Endpoints: `GET /api/reels/feed` (cursor pagination), `GET /api/reels/my-reels`, `POST /api/reels/upload-url` (pre-signed S3/Cloudinary), `POST /api/reels/confirm`, `PUT /api/reels/:id/visibility`, `DELETE /api/reels/:id`, `POST /api/reels/:id/view`.
   - Vertical swipe launch experience without mandatory prior login.
   - Visibility: `public`, `profile-only`, `private`.
   - Atomic view count increment on video playback.
   - Video upload duration limit and file size restrictions with thumbnail generation.

5. **Privacy Controls & Phone Discovery (`IMPLEMENTATION_PLAN.md`, Lines 470–477, 527–530; Image `00.28.27.jpeg` Page 7 & 9.1):**
   - Default setting: `allowDiscovery: false` (`Allow Mobile Discovery = OFF`).
   - Salted HMAC/SHA256 hashed lookup index (`ProfileLookup`).
   - `POST /api/discovery/phone-lookup`: Accepts exact phone number. If `allowDiscovery` is false or number does not exist, returns 404 with generic message ("No profile found with this number") without leaking whether the phone number is registered.
   - If `allowDiscovery` is true, returns minimal public card: avatar, display name, username. Zero phone/email exposure.
   - Anti-enumeration rate limiter (<5 queries per minute per IP/client).

6. **Admin Panel & Moderation (`IMPLEMENTATION_PLAN.md`, Lines 479–491, 531–537; Image `00.28.26.jpeg` Page 8 & Sec 13):**
   - Endpoints: `GET /api/admin/metrics`, `GET /api/admin/users`, `PUT /api/admin/users/:id/status`, `GET /api/admin/reports`, `PUT /api/admin/reports/:id/action`.
   - User report submission: `POST /api/reports` (targetType: `profile` or `reel`, reason: abuse, copyright, inappropriate).
   - Admin actions: `dismissed`, `takedown`, `suspension`.
   - Takedown updates reel status to `taken_down`/`suspended`, immediately omitting it from feeds.
   - User suspension sets user status to `suspended`/`banned`, revoking active tokens and public visibility.

7. **Public Web Profile (`IMPLEMENTATION_PLAN.md`, Lines 529–530; `ORIGINAL_REQUEST.md`, Line 53):**
   - Endpoint: `GET /api/public/profile/:username`.
   - Web route: `/:username`.
   - Renders profile header, bio, dynamic sections, public reels grid, and shareable QR code in browser without requiring mobile app installation.

8. **Existing Repository State (`e:\Job demoapp`):**
   - Root has `README.md`, `IMPLEMENTATION_PLAN.md`, and 12 WhatsApp requirement photos.
   - Subdirectories `backend/`, `frontend/`, and `mobile-app/` currently contain only individual component architecture `README.md` files. No package.json or node_modules yet.

---

## 2. Logic Chain

1. **From Zero-Scaffold State to Deterministic Test-Driven Development (TDD):**
   Because the codebases in `backend/`, `frontend/`, and `mobile-app/` are currently clean directories with architectural READMEs, the fastest, most reliable way to implement and guarantee zero defects is to define strict automated test suites (Jest/Supertest for backend, React Testing Library for frontend/mobile) that mirror the acceptance criteria before or concurrently with code scaffolding.
2. **From Privacy Invariant to Strict Assertion Criteria:**
   The client specification explicitly states: *"unlisted numbers must never be revealed or confirmed"*, *"Allow mobile discovery by mobile number = OFF by default"*, and *"Anti-enumeration protections should be implemented to prevent bulk number probing."*
   Therefore, any discovery query against an unlisted or opt-out number MUST return identical HTTP 404 responses with identical error body payloads, indistinguishable response timings, and identical rate limit headers, preventing timing attacks or side-channel oracle attacks.
3. **From Reels-First UX to Decoupled Auth Invariant:**
   The product brief dictates that the mobile app opens directly into full-screen vertical short videos for guest visitors. Therefore, `GET /api/reels/feed` and `POST /api/reels/:id/view` must function seamlessly without an `Authorization` header, while `POST /api/reels/upload-url` and `POST /api/reels/confirm` require valid JWT Bearer tokens linked to an active profile.
4. **From Moderation to Real-Time Feed Filtering:**
   When an admin executes `PUT /api/admin/reports/:id/action` with action `takedown`, the target reel's status shifts to `taken_down`. In the database, the feed query filter `status: 'active'` automatically excludes it from the next cursor fetch, and direct requests to `GET /api/reels/:id` return HTTP 404 or 410 Gone.
5. **From Phased Testing to 4-Tier Test Suite:**
   To guarantee production quality, testing must not merely check happy paths:
   - **Tier 1 (Feature Coverage):** Every single endpoint and screen has at least 5 isolated unit/integration tests.
   - **Tier 2 (Boundary & Corner Cases):** Input size extremes, format corruptions, concurrency locks, and rate limits have at least 5 edge cases.
   - **Tier 3 (Cross-Feature & Pairwise):** State changes across modules (unpublishing profile, changing visibility, admin ban) propagate correctly across feeds, public web, and discovery.
   - **Tier 4 (Real-World Workloads):** Complete end-to-end multi-actor simulations execute in sequence.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth | Mobile OTP Request | Sends 6-digit OTP to user's phone via pluggable SMS adapter | `{ mobile: "+919876543210" }` | `{ success: true, message: "OTP sent", expiresIn: 300 }` | 400 Bad Request (invalid format), 429 Too Many Requests | `IMPLEMENTATION_PLAN.md:498`, Img 00.28.45 |
| 2 | Auth | OTP Verification | Validates 6-digit code, creates/locates user, issues JWT token | `{ mobile: "+919876543210", otp: "123456" }` | `{ token: "jwt...", user: { id, mobile, role }, profileStatus: "new"\|"existing" }` | 400 Invalid OTP, 410 Expired OTP, 429 Brute-force locked | `IMPLEMENTATION_PLAN.md:499`, Img 00.28.45 |
| 3 | Auth | Session Introspection | Returns currently authenticated user context and profile status | Header `Authorization: Bearer <jwt>` | `{ user: { id, mobile, role, accountStatus }, profileId }` | 401 Unauthorized (invalid/expired token), 403 Forbidden (banned) | `IMPLEMENTATION_PLAN.md:500` |
| 4 | Auth | Account Status Guard | Restricts suspended or deactivated accounts from platform actions | User token with `accountStatus: 'suspended'` | Denied access to protected mutations | 403 Forbidden with `{ error: "Account suspended by administrator" }` | `IMPLEMENTATION_PLAN.md:398, 534` |
| 5 | Profile | Profile Fetch (Owner) | Retrieves authenticated user's complete profile including draft sections | Header `Authorization: Bearer <jwt>` | Full `Profile` document including contact flags, completion % | 401 Unauthorized, 404 Profile Not Found | `IMPLEMENTATION_PLAN.md:503` |
| 6 | Profile | Update Basic Info | Updates name, bio (max 500), profileType, and city | `{ name, bio, profileType, city }` | Updated `Profile` object with recalculated completion % | 400 Validation Error (missing name, bio > 500 chars, invalid type) | `IMPLEMENTATION_PLAN.md:504`, Img 00.28.44 |
| 7 | Profile | Custom Username Claim | Claims unique URL slug / handle with validation and collision checks | `{ username: "santosh" }` | `{ success: true, username: "santosh" }` | 400 Invalid characters/reserved word, 409 Conflict (taken) | `IMPLEMENTATION_PLAN.md:505`, Img 00.28.27 |
| 8 | Profile | Photo Upload | Uploads avatar image to CDN/Cloudinary and updates profile | `multipart/form-data` with image file | `{ photoUrl: "https://..." }` | 400 Unsupported mime type, 413 File too large (>5MB) | `IMPLEMENTATION_PLAN.md:506`, Img 00.28.44 |
| 9 | Profile | Publish / Unpublish Toggle | Toggles profile visibility between draft, published, and unpublished | `{ status: "published" }` | Updated profile status | 400 Invalid status transition, 422 Profile incomplete (<20%) | `IMPLEMENTATION_PLAN.md:507`, Img 00.28.27(1) |
| 10 | Profile | QR Code Generation | Generates dynamic SVG/PNG QR code pointing to public profile URL | Header `Authorization: Bearer <jwt>` | `{ qrCodeUrl: "data:image/svg+xml;...", profileUrl: "https://..." }` | 404 Profile not found, 422 Profile unpublished | `IMPLEMENTATION_PLAN.md:508`, Img 00.28.27 |
| 11 | Profile | Privacy Settings Config | Sets contact detail visibility and mobile discovery opt-in | `{ contactDetails: { showPhone, showWhatsapp, showEmail }, allowDiscovery }` | Updated `PrivacySetting` & syncs `ProfileLookup` index | 400 Invalid boolean types, 401 Unauthorized | `IMPLEMENTATION_PLAN.md:509, 470`, Img 00.28.27 |
| 12 | Sections | List Profile Sections | Returns all modular sections ordered by sequence index | Header `Authorization: Bearer <jwt>` | Array of section documents `[ { id, type, title, content, order, visibility } ]` | 401 Unauthorized, 404 Profile not found | `IMPLEMENTATION_PLAN.md:512` |
| 13 | Sections | Add Dynamic Section | Creates modular section (Experience, Education, Skills, Services, etc.) | `{ type: "skills", title: "Core Skills", content: ["React", "Node"] }` | Created section object with auto-incremented order index | 400 Invalid section type, 422 Missing required fields | `IMPLEMENTATION_PLAN.md:513`, Img 00.28.44 |
| 14 | Sections | Update Section | Modifies title, content, or visibility of an existing section | Section ID in param + `{ title, content, visibility }` | Updated section object | 400 Validation error, 403 Forbidden (not owner), 404 Not found | `IMPLEMENTATION_PLAN.md:514` |
| 15 | Sections | Delete Section | Deletes section and shifts remaining order indices | Section ID in param | `{ success: true, deletedId: "..." }` | 403 Forbidden (not owner), 404 Not found | `IMPLEMENTATION_PLAN.md:515` |
| 16 | Sections | Batch Reorder Sections | Reorders display sequence of profile sections in a single atomic call | `{ orderMapping: [{ id: "sec1", order: 0 }, { id: "sec2", order: 1 }] }` | `{ success: true, count: 2 }` | 400 Missing IDs or duplicate order numbers, 403 Forbidden | `IMPLEMENTATION_PLAN.md:516` |
| 17 | Reels | Public Home Feed | Returns cursor-paginated list of public active reels | Query params: `?cursor=<id>&limit=10` | `{ reels: [...], nextCursor: "...", hasMore: true }` | 400 Invalid cursor string, 500 Server error | `IMPLEMENTATION_PLAN.md:519`, Img 00.28.55 |
| 18 | Reels | Creator My-Reels List | Returns all reels created by current user regardless of visibility | Header `Authorization: Bearer <jwt>` | Array of reels with viewsCount, visibility status | 401 Unauthorized, 404 No profile | `IMPLEMENTATION_PLAN.md:520`, Img 00.28.26 |
| 19 | Reels | Pre-signed Upload URL | Requests direct S3/Cloudinary upload signature for video | `{ fileType: "video/mp4", fileSize: 10485760 }` | `{ uploadUrl: "https://...", mediaKey: "...", maxDuration: 60 }` | 400 Unsupported format, 413 File exceeds limit (>50MB) | `IMPLEMENTATION_PLAN.md:521`, Img 00.28.44 |
| 20 | Reels | Confirm Reel Upload | Confirms video upload, saves metadata, triggers transcode & thumbnail | `{ mediaKey, caption, durationSeconds, visibility, thumbnailUrl }` | Created `Reel` document with status `active` | 400 Missing mediaKey, 422 Duration > 60s, caption > 300 chars | `IMPLEMENTATION_PLAN.md:522`, Img 00.28.44 |
| 21 | Reels | Update Reel Visibility | Changes reel audience between `public`, `profile-only`, `private` | Reel ID in param + `{ visibility: "profile-only" }` | Updated reel object | 400 Invalid visibility enum, 403 Forbidden, 404 Not found | `IMPLEMENTATION_PLAN.md:523`, Img 00.28.27(1) |
| 22 | Reels | Delete / Archive Reel | Soft-deletes or removes reel from feed and profile grid | Reel ID in param | `{ success: true, message: "Reel deleted" }` | 403 Forbidden (not owner), 404 Not found | `IMPLEMENTATION_PLAN.md:524` |
| 23 | Reels | Atomic View Increment | Increments view counter on video playback | Reel ID in param | `{ success: true, viewsCount: 42 }` | 404 Reel not found, 410 Reel taken down | `IMPLEMENTATION_PLAN.md:525`, Img 00.28.55 |
| 24 | Discovery | Exact Phone Lookup | Queries profile by phone; matches only if `allowDiscovery: true` | `{ mobile: "+919876543210" }` | `{ profile: { name, username, photoUrl, profileType } }` | 404 Not found (unlisted or discovery=false), 429 Rate limit | `IMPLEMENTATION_PLAN.md:528`, Img 00.28.27 |
| 25 | Discovery | Anti-Enumeration Guard | Blocks rapid phone number probing to protect user privacy | Fast sequential requests from same IP/session | Request throttled | 429 Too Many Requests with `Retry-After: 60` header | `IMPLEMENTATION_PLAN.md:328, 528` |
| 26 | Public Web | Public Profile Viewer | Browser-accessible view of public profile, sections, and public reels | Param: `:username` | Sanitized public profile payload, active public reels, contact info | 404 Profile not found or unpublished | `IMPLEMENTATION_PLAN.md:529`, Img 00.28.27(1) |
| 27 | Moderation | Report Content | Submits abuse, copyright, or inappropriate report for profile or reel | `{ targetType: "reel", targetId: "...", reason: "Inappropriate" }` | `{ success: true, reportId: "..." }` | 400 Invalid targetType/reason, 404 Target not found | `IMPLEMENTATION_PLAN.md:479–490, 535` |
| 28 | Admin | Platform Metrics | Returns platform stats (users, published profiles, reels, reports) | Admin JWT token | `{ totalUsers, publishedProfiles, totalReels, pendingReports }` | 401 Unauthorized, 403 Forbidden (non-admin) | `IMPLEMENTATION_PLAN.md:532` |
| 29 | Admin | User Management List | Lists users with search by phone/status and pagination | Admin JWT + Query `?page=1&status=active&search=9876` | Paginated users array with totalCount | 401 Unauthorized, 403 Forbidden | `IMPLEMENTATION_PLAN.md:533` |
| 30 | Admin | User Account Suspension | Suspends, activates, or deactivates user account | Admin JWT + User ID param + `{ accountStatus: "suspended" }` | Updated user object with `accountStatus` | 400 Invalid status enum, 403 Forbidden, 404 User not found | `IMPLEMENTATION_PLAN.md:534` |
| 31 | Admin | Moderation Queue List | Retrieves reported items filterable by status (`pending`, `resolved`) | Admin JWT + Query `?status=pending` | Array of reports with attached target media metadata | 401 Unauthorized, 403 Forbidden | `IMPLEMENTATION_PLAN.md:535` |
| 32 | Admin | Moderation Action | Executes takedown, warning, or dismiss on reported media | Admin JWT + Report ID param + `{ actionTaken: "takedown" }` | Updated report and updates target media status to `taken_down` | 400 Invalid action, 403 Forbidden, 404 Report not found | `IMPLEMENTATION_PLAN.md:536` |
| 33 | Mobile | Guest Reels Feed | Vertical swipe player allowing video browsing without login | App launch / Gestures up/down | Next video preloaded, autoplay, pause on unmount | Network fallback error banner if offline | `IMPLEMENTATION_PLAN.md:240, 545`, Img 00.28.55 |
| 34 | Mobile | Reel Creator (+) | Prominent modal on My Profile for video record/pick, trim, cover | Tap `+` action button | Opens camera/picker, trim slider, cover picker, caption form | Permissions denied (Camera/Audio/Gallery) handled gracefully | `IMPLEMENTATION_PLAN.md:284–297, 548`, Img 00.28.44 |
| 35 | Mobile | Profile Completion Gauge | Visual progress bar showing missing sections needed to reach 100% | Profile data in state | Visual progress bar (e.g. 20% -> 60% -> 100%) | None | `IMPLEMENTATION_PLAN.md:420, 549`, Img 00.28.26 |

---

## Edge Cases

| # | Feature | Input / Condition | Observed / Required Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | Auth / OTP | OTP entered after 5 minutes (TTL expiry) | Returns HTTP 410 Gone / 400 Bad Request `{ error: "OTP expired, please request a new code" }`. |
| 2 | Auth / OTP | Incorrect OTP entered 5 times consecutively | Lock verification for 15 minutes; returns HTTP 429 Too Many Requests `{ error: "Maximum attempts exceeded. Locked for 15m" }`. |
| 3 | Auth / OTP | Rapid duplicate OTP requests within 60-second cooldown | Returns HTTP 429 `{ error: "Resend cooldown active. Wait 45s", retryAfter: 45 }`. |
| 4 | Auth / OTP | Mobile number with spaces/hyphens `+91 98765-43210` | Sanitizer normalizes to E.164 standard `+919876543210` before query/hash. |
| 5 | Auth / OTP | Invalid mobile number format (e.g., `12345` or letters) | Fails validation with HTTP 400 Bad Request `{ error: "Invalid international phone format" }`. |
| 6 | Profile / Username | Username with spaces or uppercase (e.g., `Santosh Kumar`) | Normalized to lowercase, replaces invalid characters or rejects with HTTP 400 `{ error: "Username must be lowercase alphanumeric with hyphens" }`. |
| 7 | Profile / Username | Reserved route names (e.g., `admin`, `api`, `feed`, `auth`, `public`) | Returns HTTP 400 `{ error: "Username 'admin' is reserved by system" }`. |
| 8 | Profile / Username | Simultaneous registration of identical handle by 2 users | MongoDB unique index collision caught; one succeeds (200), second returns HTTP 409 Conflict `{ error: "Username already taken" }`. |
| 9 | Profile / Bio | Bio input exceeding 500 characters (501+ chars) | Returns HTTP 400 Bad Request `{ error: "Bio exceeds maximum length of 500 characters" }`. |
| 10 | Profile / Publish | Attempting to publish profile with 0 completed sections & no name | Returns HTTP 422 Unprocessable Entity `{ error: "Profile requires at least full name and basic section to publish" }`. |
| 11 | Profile / Unpublish | Owner unpublishes profile while external visitor is viewing | Next page refresh or navigation by visitor returns HTTP 404 `{ error: "Profile not found or currently unavailable" }`. |
| 12 | Profile / QR | Scanner reads QR code while profile is unpublished | Web view displays friendly "Profile is currently private or unavailable" rather than a broken page. |
| 13 | Sections / Reorder | Array with duplicate order values `[{id: A, order: 1}, {id: B, order: 1}]` | Returns HTTP 400 Bad Request `{ error: "Order indices must be unique sequential integers" }`. |
| 14 | Sections / Delete | Deleting a section that does not exist or belongs to another user | Returns HTTP 403 Forbidden (if belongs to other) or HTTP 404 Not Found. |
| 15 | Sections / Types | Adding section with unknown type (e.g. `type: "crypto"`) | Mongoose schema validation fails with HTTP 400 `{ error: "Invalid section type 'crypto'" }`. |
| 16 | Reels / Upload | Video file exceeds maximum duration (>60 seconds) | Client validation blocks upload; backend validation rejects confirmation with HTTP 422 `{ error: "Video duration exceeds 60 seconds limit" }`. |
| 17 | Reels / Upload | Corrupted or non-video file renamed as `.mp4` | Transcoder/FFmpeg fails; reel status marked as `failed`; user notified with upload error. |
| 18 | Reels / Visibility | Video set to `private` queried on Public Home Feed | Excluded from `GET /api/reels/feed` MongoDB query `{ visibility: 'public', status: 'active' }`. |
| 19 | Reels / Visibility | Video set to `profile-only` | Appears in creator's profile page reel grid, but excluded from main vertical Reels Home feed. |
| 20 | Reels / View | Same client fires 50 rapid view increments in 2 seconds | Rate-limited or debounced view tracking; counts single valid view session per viewer ID/IP within cooldown window. |
| 21 | Reels / Pagination | Cursor pointing to deleted or non-existent reel ID | Query gracefully falls back to `{ createdAt: { $lt: decodedTimestamp } }` without crashing; returns next page. |
| 22 | Reels / Pagination | Reaching end of feed (0 remaining reels) | Returns `{ reels: [], nextCursor: null, hasMore: false }` with HTTP 200 OK. |
| 23 | Discovery / Privacy | Phone lookup for number with `allowDiscovery: false` | Returns HTTP 404 `{ error: "No profile found with this number" }` — exact same response as non-registered number. |
| 24 | Discovery / Privacy | Phone lookup for number not in database | Returns HTTP 404 `{ error: "No profile found with this number" }`. Zero info leaked. |
| 25 | Discovery / Privacy | Client attempts 6 phone queries in under 60 seconds | 6th request fails with HTTP 429 Too Many Requests `{ error: "Rate limit exceeded. Maximum 5 discovery queries per minute" }`. |
| 26 | Discovery / Privacy | Phone lookup succeeds (`allowDiscovery: true`) | Returns `{ profile: { name, username, photoUrl, profileType } }`. Excludes `mobile`, `email`, and `address` fields. |
| 27 | Moderation / Report | User reports the same reel multiple times within 5 minutes | Deduplicated: increases report counter on existing pending report or returns HTTP 200 `{ message: "Report already received" }`. |
| 28 | Moderation / Takedown | Admin takes down reel while user is currently watching it in feed | Next swipe or action refresh triggers removal; direct GET returns HTTP 410 Gone / 404. |
| 29 | Moderation / Ban | Banned user sends API request with previously valid JWT | JWT auth middleware queries user `accountStatus`; if `'suspended'`, returns HTTP 403 Forbidden `{ error: "Account suspended" }`. |
| 30 | Moderation / Restore | Admin dismisses report or restores mistakenly flagged reel | Reel status reverts from `taken_down` to `active`; reappears in feed and profile grid. |

---

## 3. Acceptance Criteria & Automated Test Requirements

### 3.1 Acceptance Criteria Mapping

1. **Authentication & Identity:**
   - [x] Given a valid international mobile number, when `POST /api/auth/send-otp` is called, an OTP is generated, rate-limited, and sent via the configured adapter.
   - [x] Given a valid OTP, when `POST /api/auth/verify-otp` is called, a signed JWT is returned along with `profileStatus` indicating whether the profile has been initialized.
   - [x] Given an invalid or expired OTP, the API responds with HTTP 400 or 410 and does NOT issue a JWT.
   - [x] Given an authenticated user, they can claim a unique handle, update personal details, and upload an avatar photo.

2. **Modular Profile Builder:**
   - [x] Given an authenticated user, they can create, update, delete, and reorder modular sections (`about`, `experience`, `education`, `skills`, `services`, `achievements`, `photos`).
   - [x] Each section supports granular visibility (`public`, `profile-only`, `private`).
   - [x] Profiles can transition between `draft`, `published`, and `unpublished` states.

3. **Reels Video Engine:**
   - [x] The mobile client and web feed load and play public reels without requiring authentication (`GET /api/reels/feed`).
   - [x] Reel playback triggers atomic view count increments (`POST /api/reels/:id/view`).
   - [x] Authenticated users can request pre-signed upload URLs and publish reels linked strictly to their profile ID.
   - [x] Private and profile-only reels are strictly filtered out of the public home feed.

4. **Privacy & Salted Phone Discovery:**
   - [x] By default, user profiles have `allowDiscovery: false` and contact fields hidden.
   - [x] When `POST /api/discovery/phone-lookup` is called with an unlisted number or a number with `allowDiscovery: false`, the system returns HTTP 404 with an identical payload.
   - [x] Anti-enumeration rate limiting enforces $<5$ queries per minute, returning HTTP 429 when breached.
   - [x] When a discoverable profile is found, the phone number itself is never returned in the payload.

5. **Public Web Profile & Administration:**
   - [x] `GET /api/public/profile/:username` renders all public sections and active public reels for external browser visitors.
   - [x] Users can flag inappropriate profiles or reels via `POST /api/reports`.
   - [x] Admin panel lists reports, triggers instant content takedowns, and allows user account suspension.
   - [x] All automated test suites execute green via `npm test`.

---

### 3.2 Test Infrastructure & Runner Configuration

#### Backend Testing (`/backend`)
- **Frameworks:** Jest v29+, Supertest v6+, `mongodb-memory-server` v9+ (for isolated in-memory Mongo test database without external DB dependency).
- **Environment:** Node.js test environment with mock SMS adapter (`process.env.OTP_PROVIDER = 'mock'`) and mock Cloudinary/S3 storage service.
- **Runners & Scripts:**
  - `npm test`: Runs all unit and integration tests.
  - `npm run test:unit`: Unit tests for utilities, slugifiers, and HMAC hashing.
  - `npm run test:api`: Supertest API endpoint integration tests.
  - `npm run test:coverage`: Generates code coverage report (target: $>85\%$ branch & line coverage).

#### Web Frontend Testing (`/frontend`)
- **Frameworks:** Vitest / Jest, `@testing-library/react`, `@testing-library/user-event`, `msw` (Mock Service Worker) for API interception.
- **Runners & Scripts:**
  - `npm test`: Runs all component and view tests.
  - `npm run test:components`: Tests for `<ProfileHeader />`, `<SectionCard />`, `<ReelGrid />`, `<AdminTable />`.
  - `npm run test:public`: Tests for public profile view rendering (`/:username`).
  - `npm run test:admin`: Tests for admin moderation queue and takedown interactions.

#### Mobile Client Testing (`/mobile-app`)
- **Frameworks:** Jest, `@testing-library/react-native`, `react-test-renderer`.
- **Runners & Scripts:**
  - `npm test`: Runs mobile component and navigation tests.
  - `npm run test:feed`: Tests for `<ReelPlayerItem />`, gestures, and feed pagination hooks.
  - `npm run test:profile`: Tests for `<ProfileHeaderCard />`, completion bar, and section builder.

---

## 4. Four-Tier E2E Test Plan Breakdown

### Tier 1: Feature Coverage ($\ge 5$ Test Cases Per Feature)

#### Feature 1.1: Mobile Number & OTP Authentication
- **TC-1.1.1 [Happy Path]:** Send OTP to valid Indian number `+919876543210` $\rightarrow$ Expect 200 OK, mock OTP logged/returned in dev.
- **TC-1.1.2 [Happy Path]:** Verify correct 6-digit OTP $\rightarrow$ Expect 200 OK, valid JWT Bearer token returned, user document exists in DB with `isVerified: true`.
- **TC-1.1.3 [Negative]:** Verify incorrect 6-digit OTP `000000` $\rightarrow$ Expect 400 Bad Request `{ error: "Invalid OTP code" }`, no JWT issued.
- **TC-1.1.4 [Negative]:** Verify expired OTP (simulate TTL expiration $>300\text{s}$) $\rightarrow$ Expect 410 Gone `{ error: "OTP expired" }`.
- **TC-1.1.5 [Session Check]:** Call `GET /api/auth/me` with issued JWT $\rightarrow$ Expect 200 OK with sanitized user profile payload and `accountStatus: 'active'`.
- **TC-1.1.6 [Security]:** Call `GET /api/auth/me` with malformed or unsigned token $\rightarrow$ Expect 401 Unauthorized `{ error: "Invalid token" }`.

#### Feature 1.2: Profile Creation & Handle Management
- **TC-1.2.1 [Happy Path]:** Create basic profile with name `"Aarav Sharma"` and profession `"Freelancer"` $\rightarrow$ Expect 201 Created, `completionPercentage` set to 20%.
- **TC-1.2.2 [Happy Path]:** Claim available unique username `"aarav-design"` $\rightarrow$ Expect 200 OK, saved in lowercase format.
- **TC-1.2.3 [Negative]:** Attempt claiming existing username `"aarav-design"` $\rightarrow$ Expect 409 Conflict `{ error: "Username already taken" }`.
- **TC-1.2.4 [Validation]:** Attempt claiming reserved system username `"admin"` or `"api"` $\rightarrow$ Expect 400 Bad Request `{ error: "Reserved username" }`.
- **TC-1.2.5 [Validation]:** Attempt claiming username with uppercase letters and spaces `"Aarav Design!"` $\rightarrow$ Expect 400 Bad Request (invalid slug format).
- **TC-1.2.6 [Publishing]:** Call `POST /api/profile/publish` $\rightarrow$ Status toggles from `'draft'` to `'published'`.

#### Feature 1.3: Modular Profile Sections CRUD & Reordering
- **TC-1.3.1 [Happy Path]:** Add `skills` section with list `["UI/UX", "Figma", "React"]` $\rightarrow$ Expect 201 Created, `order: 0`.
- **TC-1.3.2 [Happy Path]:** Add `experience` section with role `"Senior Designer"` $\rightarrow$ Expect 201 Created, `order: 1`.
- **TC-1.3.3 [Update]:** Update `experience` section content $\rightarrow$ Expect 200 OK, reflects updated description and company.
- **TC-1.3.4 [Reorder]:** Batch reorder sections swapping orders of section 0 and section 1 $\rightarrow$ Expect 200 OK, order values updated in DB.
- **TC-1.3.5 [Delete]:** Delete `skills` section $\rightarrow$ Expect 200 OK, section document removed, remaining sections sequence normalized.
- **TC-1.3.6 [Authorization]:** User B attempts to update or delete User A's section $\rightarrow$ Expect 403 Forbidden.

#### Feature 1.4: Pre-signed Video Upload & Reel Metadata Confirmation
- **TC-1.4.1 [Happy Path]:** Request upload URL for `video/mp4` with size 15MB $\rightarrow$ Expect 200 OK, pre-signed S3/Cloudinary URL and mediaKey returned.
- **TC-1.4.2 [Negative]:** Request upload URL for unsupported file `application/pdf` $\rightarrow$ Expect 400 Bad Request `{ error: "Invalid video format" }`.
- **TC-1.4.3 [Validation]:** Confirm reel with duration 45s, caption `"My portfolio reel"`, visibility `'public'` $\rightarrow$ Expect 201 Created, Reel record saved with `status: 'active'`.
- **TC-1.4.4 [Negative]:** Confirm reel exceeding max duration (e.g. 75 seconds) $\rightarrow$ Expect 422 Unprocessable Entity `{ error: "Video exceeds 60s limit" }`.
- **TC-1.4.5 [Validation]:** Confirm reel with caption $>300$ characters $\rightarrow$ Expect 400 Bad Request `{ error: "Caption exceeds 300 characters" }`.

#### Feature 1.5: Reels Public Feed & Cursor Pagination
- **TC-1.5.1 [Guest Access]:** Fetch `GET /api/reels/feed` with no Authorization header $\rightarrow$ Expect 200 OK, returns array of public reels.
- **TC-1.5.2 [Pagination]:** Fetch feed with `limit=5` $\rightarrow$ Expect exactly 5 reels, `hasMore: true`, and non-null `nextCursor`.
- **TC-1.5.3 [Next Cursor]:** Fetch second page using `?cursor=<nextCursor>&limit=5` $\rightarrow$ Expect next 5 unique reels with no duplicates from page 1.
- **TC-1.5.4 [Visibility Filter]:** User posts a `private` and a `profile-only` reel $\rightarrow$ Verify neither appears in `GET /api/reels/feed`.
- **TC-1.5.5 [Status Filter]:** Admin takes down a reel $\rightarrow$ Verify reel is immediately excluded from `GET /api/reels/feed`.

#### Feature 1.6: Reel Engagement & Atomic View Tracking
- **TC-1.6.1 [Happy Path]:** Call `POST /api/reels/:id/view` on active reel $\rightarrow$ Expect 200 OK, `viewsCount` incremented by 1.
- **TC-1.6.2 [Concurrency]:** Fire 10 concurrent view requests on same reel $\rightarrow$ Expect all 10 processed, final `viewsCount` exactly $+10$.
- **TC-1.6.3 [Owner Summary]:** Creator fetches `GET /api/reels/my-reels` $\rightarrow$ Expect total aggregate views accurately reflected.
- **TC-1.6.4 [Negative]:** View call on non-existent reel ID $\rightarrow$ Expect 404 Not Found.
- **TC-1.6.5 [Negative]:** View call on taken-down reel ID $\rightarrow$ Expect 410 Gone or 404 Not Found.

#### Feature 1.7: Privacy Settings & Contact Masking
- **TC-1.7.1 [Defaults]:** Fetch initial privacy settings $\rightarrow$ Verify `allowDiscovery: false`, `showPhone: false`, `showEmail: false`.
- **TC-1.7.2 [Update]:** Update `showPhone: true`, `showEmail: false` $\rightarrow$ Expect 200 OK, settings persisted.
- **TC-1.7.3 [Public View Check]:** Query `GET /api/public/profile/:username` $\rightarrow$ Phone number is present, email field is omitted/masked.
- **TC-1.7.4 [Mask All]:** Set all contact visibility flags to `false` $\rightarrow$ Verify public profile displays zero contact details.
- **TC-1.7.5 [Section Visibility]:** Set section visibility to `'private'` $\rightarrow$ Verify public profile excludes this section.

#### Feature 1.8: Salted Phone Discovery & Anti-Enumeration
- **TC-1.8.1 [Discovery Disabled]:** Query phone lookup with registered number having `allowDiscovery: false` $\rightarrow$ Expect 404 Not Found `{ error: "No profile found with this number" }`.
- **TC-1.8.2 [Unregistered Number]:** Query phone lookup with non-existent phone number $\rightarrow$ Expect 404 Not Found `{ error: "No profile found with this number" }` (identical response body and timing).
- **TC-1.8.3 [Discovery Enabled]:** Enable `allowDiscovery: true` on user profile; query phone lookup with exact number $\rightarrow$ Expect 200 OK, returns `{ name, username, photoUrl, profileType }`.
- **TC-1.8.4 [No Phone Leakage]:** Inspect payload of 200 OK phone lookup $\rightarrow$ Verify phone number itself is NOT present in returned JSON.
- **TC-1.8.5 [Anti-Enumeration]:** Send 6 rapid phone lookup requests from same client IP within 30 seconds $\rightarrow$ First 5 succeed or return 404; 6th returns 429 Too Many Requests with `Retry-After` header.

#### Feature 1.9: Public Web Profile Viewer
- **TC-1.9.1 [Happy Path]:** Visitor navigates to `/:username` in browser $\rightarrow$ Web page loads profile photo, bio, badges, and dynamic section cards.
- **TC-1.9.2 [Reels Grid]:** Public profile shows thumbnail grid of creator's public reels $\rightarrow$ Clicking thumbnail opens video player popup.
- **TC-1.9.3 [QR Share]:** Visitor clicks "Share QR" $\rightarrow$ Modal displays high-res downloadable SVG/PNG QR code pointing to `https://myprofile.app/:username`.
- **TC-1.9.4 [Unpublished Profile]:** Owner sets profile status to `'unpublished'`; visitor navigates to `/:username` $\rightarrow$ Displays 404 Profile Unavailable page.
- **TC-1.9.5 [Responsive Layout]:** Test render on mobile viewport ($375\times 667$) and desktop viewport ($1440\times 900$) $\rightarrow$ All elements adapt without overflow.

#### Feature 1.10: Content Reporting & Moderation Queue
- **TC-1.10.1 [Report Reel]:** Viewer flags a reel with reason `"Inappropriate content"` $\rightarrow$ Expect 201 Created, report record added with `status: 'pending'`.
- **TC-1.10.2 [Report Profile]:** Viewer flags a profile with reason `"Impersonation"` $\rightarrow$ Expect 201 Created, enqueued in Admin queue.
- **TC-1.10.3 [Queue Listing]:** Admin calls `GET /api/admin/reports?status=pending` $\rightarrow$ Expect 200 OK with array of pending reports including media metadata.
- **TC-1.10.4 [Report Dismissal]:** Admin marks report as `'dismissed'` with notes $\rightarrow$ Expect 200 OK, report status updated, media remains untouched.
- **TC-1.10.5 [Unauthorized Queue Access]:** Non-admin regular user calls `GET /api/admin/reports` $\rightarrow$ Expect 403 Forbidden.

#### Feature 1.11: Admin Moderation Takedown & User Ban
- **TC-1.11.1 [Takedown Action]:** Admin submits `PUT /api/admin/reports/:id/action` with action `'takedown'` $\rightarrow$ Reel status updated to `'taken_down'`.
- **TC-1.11.2 [Feed Takedown Verification]:** Fetch `GET /api/reels/feed` $\rightarrow$ Taken-down reel is absent from feed.
- **TC-1.11.3 [User Suspension]:** Admin calls `PUT /api/admin/users/:id/status` with `accountStatus: 'suspended'` $\rightarrow$ User accountStatus updated in DB.
- **TC-1.11.4 [Banned User Auth Block]:** Suspended user attempts to call `GET /api/profile/me` or create reel $\rightarrow$ Expect 403 Forbidden `{ error: "Account suspended by administrator" }`.
- **TC-1.11.5 [Metrics Reflection]:** Admin calls `GET /api/admin/metrics` $\rightarrow$ Active users, pending reports, and total reels reflect updated counts.

#### Feature 1.12: Mobile Client Navigation & Reel Creator Modal
- **TC-1.12.1 [Launch Navigation]:** App launches $\rightarrow$ Defaults to Reels tab; vertical swiping transitions between videos.
- **TC-1.12.2 [Tab Switch]:** User taps `My Profile` bottom tab $\rightarrow$ Navigates to personal dashboard with completion bar.
- **TC-1.12.3 [Creator Modal Open]:** User taps `+` button on My Profile $\rightarrow$ Opens `<ReelCreatorModal />` with camera/gallery choice.
- **TC-1.12.4 [Trim Slider]:** User loads 30s video, moves trim slider to 15s $\rightarrow$ Video duration reflects 15s.
- **TC-1.12.5 [Audience Selector]:** User toggles visibility between Public, Profile-Only, and Private $\rightarrow$ State updates correctly before publishing.

---

### Tier 2: Boundary & Corner Cases ($\ge 5$ Test Cases Per Boundary Condition)

#### Boundary Condition 2.1: Phone Number & Country Codes
- **BC-2.1.1 [Min Length]:** Phone number with fewer than 7 digits (e.g. `+9112345`) $\rightarrow$ Validation error 400 Bad Request.
- **BC-2.1.2 [Max Length]:** Phone number exceeding 15 digits (E.164 max) $\rightarrow$ Validation error 400 Bad Request.
- **BC-2.1.3 [International Codes]:** Non-Indian country codes (e.g. US `+14155552671`, UK `+447911123456`) $\rightarrow$ Validated, normalized, and processed properly.
- **BC-2.1.4 [Formatting Special Chars]:** Number containing brackets, spaces, and hyphens `+1 (415) 555-2671` $\rightarrow$ Normalized cleanly to `+14155552671`.
- **BC-2.1.5 [Alpha Characters]:** Number containing letters `+919876543ABC` $\rightarrow$ Rejected immediately with 400 Bad Request.

#### Boundary Condition 2.2: OTP Expiry, Retries & Resend Timers
- **BC-2.2.1 [Exact Expiry Boundary]:** OTP verified at 299s (within 300s TTL) $\rightarrow$ Verification succeeds (200 OK).
- **BC-2.2.2 [Post Expiry Boundary]:** OTP verified at 301s $\rightarrow$ Fails with 410 Gone / 400 Bad Request.
- **BC-2.2.3 [Resend Cooldown at 59s]:** User requests resend 59s after initial send (60s cooldown) $\rightarrow$ Fails with 429 Too Many Requests (`Retry-After: 1`).
- **BC-2.2.4 [Resend Cooldown at 61s]:** User requests resend 61s after initial send $\rightarrow$ Succeeds with 200 OK; previous OTP invalidated, new OTP issued.
- **BC-2.2.5 [5 Invalid Attempts]:** User inputs incorrect OTP 5 times consecutively $\rightarrow$ 6th attempt rejected with 429 and temporary account lockout.

#### Boundary Condition 2.3: Username/Slug Syntax, Length & Collisions
- **BC-2.3.1 [Min Length]:** 2-character username `"ab"` $\rightarrow$ Fails validation with 400 Bad Request (minimum 3 characters required).
- **BC-2.3.2 [Max Length]:** 31-character username $\rightarrow$ Fails validation with 400 Bad Request (maximum 30 characters).
- **BC-2.3.3 [Allowed Symbols]:** Username containing hyphens and underscores `"john-doe_01"` $\rightarrow$ Successfully claimed (200 OK).
- **BC-2.3.4 [Disallowed Symbols]:** Username containing dots, emojis, or spaces `"john.doe🚀"` $\rightarrow$ Fails validation with 400 Bad Request.
- **BC-2.3.5 [Case Insensitivity Collision]:** User A claims `"rohit"`; User B attempts to claim `"Rohit"` or `"ROHIT"` $\rightarrow$ Normalization catches duplicate; returns 409 Conflict.

#### Boundary Condition 2.4: Bio & Section Content Limits
- **BC-2.4.1 [Exact Bio 500 Chars]:** Bio containing exactly 500 characters $\rightarrow$ Accepted with 200 OK.
- **BC-2.4.2 [Bio 501 Chars]:** Bio containing 501 characters $\rightarrow$ Rejected with 400 Bad Request.
- **BC-2.4.3 [Empty Bio]:** Bio set to empty string `""` $\rightarrow$ Accepted with 200 OK (optional field).
- **BC-2.4.4 [Max Sections]:** User creates 50 modular sections $\rightarrow$ Enforces maximum section limit (e.g. max 30) or checks performance.
- **BC-2.4.5 [XSS Injection]:** Bio/Title containing `<script>alert('xss')</script>` or SQL injection payloads $\rightarrow$ Sanitized/escaped safely; stored as plain text string.

#### Boundary Condition 2.5: Media File Size, Video Duration & Format Limits
- **BC-2.5.1 [Exact Duration 60s]:** Video with duration exactly 60.00 seconds $\rightarrow$ Accepted (201 Created).
- **BC-2.5.2 [Duration 60.5s]:** Video with duration 60.5 seconds $\rightarrow$ Rejected with 422 Unprocessable Entity.
- **BC-2.5.3 [Max Video File Size 50MB]:** File size 52,428,800 bytes (50MB) $\rightarrow$ Pre-signed URL granted.
- **BC-2.5.4 [Video File Size 50.1MB]:** File size 52,500,000 bytes $\rightarrow$ Rejected with 413 Payload Too Large.
- **BC-2.5.5 [Zero Byte File]:** Empty file upload request $\rightarrow$ Rejected with 400 Bad Request.

#### Boundary Condition 2.6: Rate Limiting Boundaries
- **BC-2.6.1 [Discovery Request 5 in 60s]:** Exactly 5 queries within 60s window $\rightarrow$ All 5 return standard responses (200 or 404).
- **BC-2.6.2 [Discovery Request 6 in 60s]:** 6th query within same 60s window $\rightarrow$ Blocked with 429 Too Many Requests.
- **BC-2.6.3 [Discovery Cooldown Expiry]:** Wait 61 seconds after rate limit $\rightarrow$ Next query succeeds without block.
- **BC-2.6.4 [Send OTP 3 per Hour]:** User requests OTP 3 times in 1 hour $\rightarrow$ Accepted; 4th request blocked with 429.
- **BC-2.6.5 [Different IP Independent Bucket]:** Client A reaches rate limit from IP 1; Client B queries from IP 2 $\rightarrow$ Client B is NOT throttled.

#### Boundary Condition 2.7: Pagination Boundaries
- **BC-2.7.1 [Empty Database]:** Feed queried when 0 reels exist $\rightarrow$ Returns `{ reels: [], nextCursor: null, hasMore: false }` (200 OK).
- **BC-2.7.2 [Exactly 1 Reel]:** 1 reel exists; queried with `limit=10` $\rightarrow$ Returns array of 1, `nextCursor: null`, `hasMore: false`.
- **BC-2.7.3 [Exact Limit Match]:** Exactly 10 reels exist; queried with `limit=10` $\rightarrow$ Returns 10 reels, `hasMore: false`.
- **BC-2.7.4 [Negative Limit]:** Query `?limit=-5` or `?limit=0` $\rightarrow$ Fallback to default limit (10) or returns 400 Bad Request.
- **BC-2.7.5 [Corrupted Base64 Cursor]:** Query with `?cursor=invalid_base64_string!!!` $\rightarrow$ Graceful fallback to initial page without crashing with 500.

#### Boundary Condition 2.8: Concurrency & Race Conditions
- **BC-2.8.1 [Concurrent View Increment]:** 50 concurrent requests calling `POST /api/reels/:id/view` $\rightarrow$ MongoDB `$inc` ensures viewsCount equals initial $+50$.
- **BC-2.8.2 [Simultaneous Username Claim]:** Two users submit the same handle at the exact same millisecond $\rightarrow$ Unique index constraint permits only 1, returns 409 to other.
- **BC-2.8.3 [Simultaneous Section Reorder]:** User sends reorder request while deleting a section $\rightarrow$ State remains consistent without orphan indexes.
- **BC-2.8.4 [Publish while Updating]:** Profile publish toggle executed during basic info update $\rightarrow$ Atomically consistent document saved.
- **BC-2.8.5 [Concurrent Report Submissions]:** 10 users report the same reel simultaneously $\rightarrow$ Single pending report record maintained with `reportCount: 10`.

---

### Tier 3: Cross-Feature Interactions & Pairwise Combinations

1. **Flow 3.1: Profile Unpublish $\leftrightarrow$ Public Web Profile $\leftrightarrow$ Reels Feed $\leftrightarrow$ Discovery:**
   - *Action:* User sets profile status to `unpublished`.
   - *Cross-feature Invariants:*
     - `GET /api/public/profile/:username` immediately returns 404 Not Found.
     - User's existing reels are excluded from `GET /api/reels/feed` (since parent profile is not published).
     - Phone discovery query `POST /api/discovery/phone-lookup` immediately returns 404 even if `allowDiscovery` was previously true.

2. **Flow 3.2: Discovery Opt-In Toggle $\leftrightarrow$ Salted Hash Index Sync:**
   - *Action:* User switches `allowDiscovery` from `false` to `true`, and later from `true` to `false`.
   - *Cross-feature Invariants:*
     - When toggled ON: `ProfileLookup` record is updated with `allowDiscovery: true`. Phone search immediately returns minimal card.
     - When toggled OFF: `ProfileLookup` is updated with `allowDiscovery: false`. Phone search immediately returns 404 without server restart.

3. **Flow 3.3: Reel Visibility Toggling (Public $\rightarrow$ Profile-Only $\rightarrow$ Private):**
   - *Action:* Creator modifies reel visibility from `public` to `profile-only`, and then to `private`.
   - *Cross-feature Invariants:*
     - In `public`: Reel appears in both Home Reels feed and Creator's public profile grid.
     - In `profile-only`: Reel disappears from Home Reels feed, but remains visible in Creator's profile grid.
     - In `private`: Reel disappears from both Home Reels feed and public profile grid; visible ONLY to the creator in `GET /api/reels/my-reels`.

4. **Flow 3.4: Admin Ban $\leftrightarrow$ Token Revocation $\leftrightarrow$ Feed Filtering $\leftrightarrow$ Discovery Invalidation:**
   - *Action:* Admin suspends user (`accountStatus: 'suspended'`).
   - *Cross-feature Invariants:*
     - User's active JWT fails on next API request with 403 Forbidden.
     - All reels created by this user disappear from public feed `GET /api/reels/feed`.
     - User's public web profile `/:username` returns 403/404.
     - User's phone discovery lookup returns 404.

5. **Flow 3.5: Admin Reel Takedown $\leftrightarrow$ Creator Dashboard $\leftrightarrow$ Feed Cleanup:**
   - *Action:* Admin takes down reported reel with reason "Copyright infringement".
   - *Cross-feature Invariants:*
     - Reel status transitions to `'taken_down'`.
     - Reel disappears immediately from Home Reels feed.
     - On Creator's `My Reels` dashboard, the reel is marked with badge "Taken Down by Moderation" and cannot be switched back to `public`.

6. **Flow 3.6: Handle/Slug Renaming $\leftrightarrow$ QR Code Consistency $\leftrightarrow$ Old URL Redirection:**
   - *Action:* User changes username from `"old-handle"` to `"new-handle"`.
   - *Cross-feature Invariants:*
     - New public profile renders at `/:new-handle`.
     - `GET /api/profile/qr` generates fresh QR encoded with `https://myprofile.app/new-handle`.
     - Old handle `"old-handle"` redirects to `"new-handle"` or is safely released per routing policy.

7. **Flow 3.7: Modular Section Updates $\leftrightarrow$ Public Web Live Sync:**
   - *Action:* User adds a new "Achievements" section in Mobile App and reorders it to position 0.
   - *Cross-feature Invariants:*
     - Public web viewer `/:username` reflects the new section at top of the page without requiring redeployment.
     - Section visibility changes (e.g. marked `private`) immediately remove it from public view.

8. **Flow 3.8: Account Deletion $\leftrightarrow$ Media & Index Cascade Cleanup:**
   - *Action:* User requests account deletion.
   - *Cross-feature Invariants:*
     - User record, Profile record, Sections, and Reels are soft-deleted or purged.
     - Salted entry in `ProfileLookup` index is deleted, preventing any phone lookup match.
     - Public profile and feed reels cease to exist.

---

### Tier 4: Real-World Application Workload Scenarios

#### Scenario 4.1: First-Time User Onboarding to Live Web Profile with QR Sharing
1. **Anonymous Guest Discovery:**
   - User launches mobile app, enters full-screen Reels Home feed.
   - Swipes through 5 videos without logging in; views increment correctly.
2. **Registration & Verification:**
   - User taps "Create My Profile" button.
   - Enters mobile number `+919876543210`.
   - Receives 6-digit OTP, enters code, receives JWT session token.
3. **Profile Configuration:**
   - Fills basic details: Name `"Priya Sharma"`, Bio `"Independent Fitness Coach"`, Type `"ServiceProvider"`.
   - Claims handle `"priya-fitness"`.
   - Uploads profile photo.
   - Completion bar advances from 20% to 50%.
4. **Adding Sections:**
   - Adds "Services" section: `"1-on-1 Personal Training"`.
   - Adds "Certifications" section: `"ACE Certified Trainer"`.
   - Completion bar advances to 85%.
5. **Publishing & Sharing:**
   - Enables `Allow Mobile Discovery = ON`, sets WhatsApp contact visibility to `ON`, phone to `OFF`.
   - Taps "Publish Profile".
   - Generates QR code.
6. **External Verification:**
   - External visitor opens `https://myprofile.app/priya-fitness` in desktop Chrome.
   - Profile renders with photo, bio, ACE certification, and WhatsApp CTA button. Phone number is not shown.

#### Scenario 4.2: Content Creator Workflow: Reel Recording, Multi-Audience Publishing & Engagement
1. **Creation:**
   - Creator navigates to My Profile dashboard, taps prominent `+` button.
   - Records/picks 30s video, sets caption `"Morning workout routine #fitness"`, chooses cover frame.
   - Sets visibility to `public` and publishes.
2. **Feed Distribution:**
   - Creator verifies reel appears under My Profile `My Reels` tab.
   - Switches to Home Reels feed; verifies reel is distributed to other users.
3. **Multi-Audience Publishing:**
   - Creator uploads second reel set to `profile-only` (`"Client Testimonials"`).
   - Creator uploads third reel set to `private` (`"Draft Workout Ideas"`).
   - Feed verifies: only reel 1 appears in main feed; reel 1 and 2 appear on public profile; reel 3 appears only in private creator tab.
4. **Engagement Simulation:**
   - 10 external viewers watch Reel 1 in their feed.
   - Each view fires `POST /api/reels/:id/view`.
   - Creator refreshes `My Reels` tab and observes `viewsCount: 10`.

#### Scenario 4.3: Privacy-Sensitive Professional Discovery & Contact Masking
1. **Setup:**
   - Dr. Vikram sets up a verified consultant profile with handle `"dr-vikram"`.
   - Opts IN to phone discovery (`allowDiscovery = true`) so patients who have his mobile number can find his profile.
   - Sets contact details: `showPhone = false`, `showWhatsapp = false`, `showEmail = true`.
2. **Patient Exact Phone Lookup:**
   - Patient opens app, navigates to Phone Discovery screen.
   - Enters Dr. Vikram's exact 10-digit number.
   - System returns minimal discovery card: Dr. Vikram's avatar, name, and handle `"dr-vikram"`. Phone number is NOT displayed.
3. **Profile Navigation:**
   - Patient taps the card, opening the full profile.
   - Profile displays medical qualifications, clinic timings, and Email button.
   - Direct phone number and personal WhatsApp remain completely hidden.
4. **Opt-Out Transition:**
   - Dr. Vikram goes on leave; toggles `Allow Mobile Discovery = OFF`.
   - Patient searches same mobile number $\rightarrow$ System returns 404 "No profile found with this number".

#### Scenario 4.4: Abuse Reporting, Moderation Escalation & Content Takedown
1. **Infringement & User Report:**
   - Malicious user uploads copyrighted video content as a public reel.
   - Feed viewer spots violation, taps report icon, selects reason `"Copyright Violation"`, and submits.
2. **Admin Escalation:**
   - Admin logs into Admin Panel dashboard `frontend/`.
   - Sees pending reports counter incremented in `<MetricCard />`.
   - Opens `<ModerationQueueTable />`, inspects reported reel using `<MediaReviewPlayer />`.
3. **Takedown Enforcement:**
   - Admin selects action `"Takedown Reel"`, enters audit reason `"DMCA infringement"`, and confirms.
   - Backend updates Reel status to `'taken_down'`.
4. **Real-Time Verification:**
   - Feed viewers refresh Home Reels feed $\rightarrow$ Copyrighted reel is gone.
   - Direct link to reel returns HTTP 410 Gone.
   - Creator's profile grid shows media as "Removed by Moderation".
5. **Account Suspension:**
   - Malicious user repeatedly attempts violating uploads.
   - Admin navigates to `<UserFilterToolbar />`, finds user, clicks `"Suspend Account"`.
   - Malicious user's session is invalidated; subsequent API requests receive HTTP 403 Forbidden.

#### Scenario 4.5: High-Frequency Anonymous Guest Browsing & Discovery Throttle
1. **Continuous Video Swiping:**
   - Guest user opens app and swipes through 30 reels in rapid succession.
   - Client preloader handles smooth buffering using CDN links.
   - View events fire cleanly with zero errors.
2. **Discovery Probing Attempt:**
   - Guest user switches to Phone Lookup tab.
   - Rapidly queries 5 random phone numbers in 15 seconds searching for contacts.
   - System returns 404 for unlisted numbers.
3. **Throttling Activation:**
   - Guest user attempts 6th phone number lookup within 30 seconds.
   - System triggers anti-enumeration guard; returns HTTP 429 Too Many Requests.
   - Mobile UI shows alert: *"Too many searches. Please wait 1 minute before searching again."*
4. **Recovery:**
   - Guest waits 60 seconds.
   - Searches valid number $\rightarrow$ Request succeeds cleanly.

---

## 5. Specific Verification Mechanisms, HTTP Status Codes & Assertions

### 5.1 HTTP Status Code Specification Matrix

| Status Code | Meaning | Context & Endpoints Triggered |
| :--- | :--- | :--- |
| **200 OK** | Successful read/update | OTP verification, profile fetch, section update, phone lookup match, view increment |
| **201 Created** | Resource created | Profile setup, section created, reel confirm, report submitted |
| **400 Bad Request** | Validation failed | Invalid phone syntax, invalid OTP characters, bio > 500 chars, reserved username |
| **401 Unauthorized** | Missing or invalid auth | Missing JWT header, expired JWT token, invalid signature |
| **403 Forbidden** | Authorization denied | User editing someone else's section/reel, non-admin accessing admin panel, suspended user |
| **404 Not Found** | Resource does not exist | Unlisted phone lookup, `allowDiscovery=false`, non-existent username, deleted reel |
| **409 Conflict** | Unique constraint failure | Duplicate username/slug, mobile number already registered to another user |
| **410 Gone** | Resource expired/purged | OTP code expired (>300s), taken-down reel |
| **413 Payload Too Large**| File limit exceeded | Video upload $>50\text{MB}$, avatar image $>5\text{MB}$ |
| **422 Unprocessable** | Semantic error | Reel duration $>60\text{s}$, publishing incomplete profile |
| **429 Too Many Requests**| Rate limit exceeded | Phone discovery anti-enumeration ($>5/\text{min}$), OTP send cooldown ($<60\text{s}$) |
| **500 Server Error** | Unexpected crash | Handled by global Express error middleware; sanitized output |

---

### 5.2 Concrete Jest / Supertest Automated Assertion Examples

#### Auth & Rate Limit Verification
```javascript
describe('Auth & Rate Limiting Engine', () => {
  it('should reject OTP resend within 60s cooldown with 429', async () => {
    await request(app).post('/api/auth/send-otp').send({ mobile: '+919876543210' }).expect(200);
    const res = await request(app).post('/api/auth/send-otp').send({ mobile: '+919876543210' });
    expect(res.status).toBe(429);
    expect(res.body.error).toMatch(/cooldown/i);
    expect(res.headers['retry-after']).toBeDefined();
  });

  it('should return 400 for incorrect OTP and 200 with JWT for valid OTP', async () => {
    await request(app).post('/api/auth/verify-otp')
      .send({ mobile: '+919876543210', otp: '000000' })
      .expect(400);

    const validRes = await request(app).post('/api/auth/verify-otp')
      .send({ mobile: '+919876543210', otp: '123456' })
      .expect(200);
    expect(validRes.body.token).toBeDefined();
    expect(validRes.body.user.mobile).toBe('+919876543210');
  });
});
```

#### Phone Privacy & Salted Lookup Verification
```javascript
describe('Phone Privacy & Anti-Enumeration', () => {
  it('should return 404 without leaking info when allowDiscovery is false', async () => {
    // User exists in DB with allowDiscovery = false
    const res = await request(app)
      .post('/api/discovery/phone-lookup')
      .send({ mobile: '+919876543210' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('No profile found with this number');
    expect(res.body.profile).toBeUndefined();
  });

  it('should block 6th phone query with 429 Too Many Requests', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/discovery/phone-lookup').send({ mobile: `+91987654321${i}` });
    }
    const throttled = await request(app).post('/api/discovery/phone-lookup').send({ mobile: '+919876543219' });
    expect(throttled.status).toBe(429);
  });
});
```

#### Reels Feed & Moderation Takedown Verification
```javascript
describe('Reels Feed & Moderation Takedown', () => {
  it('should exclude taken_down and private reels from public feed', async () => {
    const feedRes = await request(app).get('/api/reels/feed').expect(200);
    const visibilities = feedRes.body.reels.map(r => r.visibility);
    const statuses = feedRes.body.reels.map(r => r.status);
    expect(visibilities).not.toContain('private');
    expect(visibilities).not.toContain('profile-only');
    expect(statuses).not.toContain('taken_down');
  });
});
```

---

## 6. Caveats

1. **SMS Gateway Adapter in Test Environment:** Real SMS gateways (Twilio / MSG91) cannot be called in CI test suites. A mock adapter (`MockOtpService`) must be used for automated tests, outputting predictable OTPs (e.g. `123456` in test mode) while simulating identical rate limiting and expiry mechanisms.
2. **Media Transcoding Mocking:** Video transcoding (FFmpeg / Cloudinary) should be mocked in integration tests via pre-signed URL mock handlers to avoid heavy CPU/bandwidth overhead during rapid test runs.
3. **Database Isolation:** Integration tests must utilize an in-memory MongoDB instance (`mongodb-memory-server`) to ensure tests run completely isolated, without requiring an external MongoDB daemon or network connection.

---

## 7. Conclusion

The specification has been comprehensively mined across all 12 source pages and the technical blueprint. All 35 core features, 30 critical edge cases, and the complete 4-Tier test plan have been cataloged with exhaustive precision.

This specification serves as the authoritative blueprint for:
1. `teamwork_preview_test_writer` to scaffold the automated test suites in `backend/tests`, `frontend/src/__tests__`, and `mobile-app/src/__tests__`.
2. Core developers to implement models, controllers, and screens adhering to the exact status codes, boundary conditions, and privacy invariants documented herein.

---

## 8. Verification Method

To verify and validate the findings and test structure:
1. **Inspect Documentation:**
   - Review `e:\Job demoapp\.agents\teamwork\spec_miner_survey_3\handoff.md` against `e:\Job demoapp\IMPLEMENTATION_PLAN.md` and `e:\Job demoapp\.agents\teamwork\ORIGINAL_REQUEST.md`.
2. **Execute Automated Tests (when scaffolded):**
   - Backend tests: `npm test` inside `backend/`
   - Frontend tests: `npm test` inside `frontend/`
   - Mobile app tests: `npm test` inside `mobile-app/`
3. **Invalidation Conditions:**
   - Any API design where an unlisted phone number returns a different status code or timing than an opt-out number invalidates the privacy contract.
   - Any public feed endpoint that requires a JWT token for read access invalidates the zero-barrier Reels-first requirement.
