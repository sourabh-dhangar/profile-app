# Specification Mining Handoff Report: Personal Digital Profile Platform (MyProfile)

**Author:** `spec_miner_survey_2`  
**Working Directory:** `e:\Job demoapp\.agents\teamwork\spec_miner_survey_2`  
**Target Recipient:** Orchestrator (`orchestrator_1` / `db4ab9ec-ee75-4233-b50c-743cb20b0522`)  
**Date:** 2026-10-09  
**Specification Sources:**
- `e:\Job demoapp\IMPLEMENTATION_PLAN.md` (Version 2 Architecture Blueprint & Implementation Plan)
- `e:\Job demoapp\.agents\teamwork\ORIGINAL_REQUEST.md` (Original User Request & Technical Requirements R1–R5)
- All 12 Original Specification Source Documents (`WhatsApp Image 2026-10-10 at 00.28.03.jpeg` through `00.28.56.jpeg`, Pages 1–12 of the Revised Developer Product Brief & MVP Functional Specification v2)
- Repository Structure & Existing Readmes (`README.md`, `backend/README.md`, `frontend/README.md`, `mobile-app/README.md`)

---

## 1. Observation

Direct observations from source inspection:

1. **Document Authority & Integrity:**
   - `IMPLEMENTATION_PLAN.md` (Lines 1–596) and the 12 specification images (`WhatsApp Image 2026-10-10 at 00.28.03.jpeg` to `00.28.56.jpeg`) establish the exact product vision: *"One Person $\to$ One Profile $\to$ One Shareable Identity $\to$ Optional Reels & Social Engagement"*.
   - `ORIGINAL_REQUEST.md` (Lines 1–61) confirms the target technology stack: Backend (Node.js, Express, MongoDB Mongoose), Mobile App (React Native with Expo managed workflow, React Navigation, expo-video/expo-av, expo-camera), Web App (React.js, Vite), Media Storage (Cloudinary with local development fallback).
   
2. **Current Repository State:**
   - `e:\Job demoapp` currently contains `backend/README.md`, `frontend/README.md`, and `mobile-app/README.md` alongside the 12 spec images and `IMPLEMENTATION_PLAN.md`. No application code or dependencies have been scaffolded yet.

3. **Core Functional Pillars Identified:**
   - **Reels-First Experience:** App launches directly into a vertical full-screen short-video feed with guest browsing (no forced auth before viewing; Page 2 §4.2, `IMPLEMENTATION_PLAN.md` Line 240).
   - **Identity Dashboard (`My Profile`):** Dedicated bottom tab navigation leading to completion progress, edit details, and QR code sharing (Page 2 §4.4, Page 8 §11).
   - **Dedicated Reel Creator (`+`):** Prominent '+' action on My Profile allowing camera/gallery video capture, trimming, cover selection, and audience visibility settings (Public, Profile-Only, Private; Page 5 §5.1).
   - **Modular Profile Builder:** Dynamic sections including About Me, Experience, Education, Skills, Services, Achievements, Photos, Social Links, and Contact Details (Page 5 §5).
   - **Privacy-Preserving Mobile Discovery:** Exact mobile number search with opt-in control (`Allow Mobile Discovery = OFF` by default). Unlisted numbers must return 404 without leaking registration status (Page 7 §9.1, `ORIGINAL_REQUEST.md` Line 54).
   - **Public Web Profile Viewer (`/:username`):** Browser-accessible responsive profile viewable in Chrome/Safari/Firefox without app installation (Page 6 §8).
   - **Admin Moderation Panel:** Web management console for reported profiles and reels, content takedowns, user suspensions, and platform metrics (Page 8 §13).
   - **Audit Trail & Logging:** Admin and moderation actions require structured audit logging to record actor, action, target, and timestamp.

---

## 2. Logic Chain

1. **User Experience Separation:**
   - *Observation:* Page 1 §1.1 & Page 2 Developer Note explicitly state: *"Do not force users to create a reel. Reels are an optional social layer on top of the core profile identity product."*
   - *Inference:* The architecture must decouple profile existence from reel publishing. A user can maintain a 100% complete, published profile with zero reels. Guest users can consume the public Reels feed without creating an account or logging in.

2. **Mobile Number Privacy & Anti-Enumeration Logic:**
   - *Observation:* Page 7 §9.1 & `ORIGINAL_REQUEST.md` Line 18 require: *"Unlisted numbers must never be revealed or confirmed"*; *"Search results should reveal only the minimum information necessary (profile photo + display name + username) and phone number itself is NOT exposed."*
   - *Inference:* 
     - The database must NOT perform a raw query against plaintext phone numbers for discovery.
     - A dedicated `ProfileLookup` collection with a cryptographically salted HMAC-SHA256 hash (`hashedPhone = HMAC_SHA256(E164(phone), PHONE_HASH_SALT)`) must be used.
     - When `allowDiscovery` is `false`, the API must return a 404 response identical in status, message, and execution timing to a non-existent phone number, mitigating timing attacks and enumeration.
     - An IP- and account-based rate limiter (maximum 5 lookups/minute) must guard against brute-force sweeping.

3. **Media Pipeline Optimization for Indian Networks:**
   - *Observation:* Page 2 §4.2, Page 5 §6, and Page 9 §16 demand fast performance on budget Android devices and ordinary Indian cellular networks.
   - *Inference:* 
     - Video uploads must support client-side trimming, pre-signed upload URLs to Cloudinary/S3, fast-start encoding (HLS/MP4 web-optimized), automatic thumbnail generation, and adaptive bitrate delivery.
     - A local disk storage fallback adapter is required for offline development without third-party API keys.

4. **Persistence & Data Schema Structure:**
   - *Observation:* Page 9 §15 outlines entities: `User`, `Profile`, `Section`, `Media`, `Reel`, `ReelEngagement`, `PrivacySetting`, `ProfileLookup`, and `Report`. The prompt also explicitly specifies `AuditLog`.
   - *Inference:* MongoDB models must enforce referential integrity via Mongoose `ObjectId` references, unique compound indexes (e.g., `username`, `mobile`, `hashedPhone`), and cascading actions on account deletion or suspension.

---

## 3. Caveats

1. **Third-Party SMS Gateway:** In development, an in-memory/console mock adapter for OTP generation and validation will be used. Production requires a pluggable adapter for providers such as Twilio, MSG91, or Fast2SMS.
2. **Phase 1 Scope vs. Future Roadmap:** Marketplace/lead directories, advanced AI bio writing, in-app real-time chat, and payment gateways are explicitly tagged as Phase 2 / Future Roadmap (Page 10 §17 "Do Not Overbuild in Version 1") and must not be implemented in MVP.
3. **Minors & Child Safety:** The spec stipulates age consent metadata (`ageConsent: { isAdult: Boolean, guardianConsent: Boolean }`). For minors, phone discovery must be permanently disabled by policy.

---

## 4. Conclusion

The specification provides a complete, unambiguous blueprint for the **MyProfile** platform. The system cleanly delineates:
- **Mobile client (Expo React Native):** Reels vertical feed, My Profile dashboard, Reel creator, Phone lookup.
- **Web client (React.js):** Public profile route `/:username`, Admin moderation dashboard.
- **Backend API (Express.js + MongoDB):** Auth (OTP/JWT), Profile CRUD, Modular Section engine, Reels cursor feed, Salted phone discovery, Moderation queue, Audit logging.
- **Security:** HMAC-SHA256 salted phone hash, zero enumeration leakage, rate-limiting, and RBAC (`user`, `moderator`, `admin`).

---

## 5. Verification Method

To verify these specifications independently against authoritative sources:
1. **Source Inspection:** Verify exact section references across `IMPLEMENTATION_PLAN.md` and the 12 JPEG images in `e:\Job demoapp`.
2. **Automated Backend Verification:**
   ```bash
   cd "e:\Job demoapp\backend"
   npm test
   ```
   Validates:
   - OTP send/verify returns JWT and profile status.
   - Profile CRUD and section reordering.
   - Cursor-based Reels feed pagination and view incrementing.
   - Phone discovery returns 404 for unlisted or disabled numbers without timing discrepancies.
   - Admin moderation triggers immediate reel takedown and user suspension.
3. **Web & Mobile Verification:**
   ```bash
   cd "e:\Job demoapp\frontend"
   npm test
   ```
   Validates public profile rendering (`/:username`) and Admin moderation tables.

---

# Detailed Specification Mining Findings

## Section A: Complete Feature Inventory

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth | Send Mobile OTP | Dispatches a 6-digit numeric OTP to the provided mobile number. | `mobile` (E.164 string), `countryCode` | `{ success: true, message: "OTP sent successfully", expiresIn: 300 }` | 400 (Invalid phone format), 429 (Rate limit: max 3 requests / 10 min) | `IMPLEMENTATION_PLAN.md` §6.1, Spec Page 4 §4.5 |
| 2 | Auth | Verify Mobile OTP | Validates the OTP; creates user if not exists; generates JWT session token. | `mobile`, `otp` (6 digits) | `{ token: string, user: { id, mobile, role }, profileStatus: "incomplete" \| "completed" }` | 400 (Invalid/Expired OTP), 429 (Max 5 failed attempts locks OTP) | `IMPLEMENTATION_PLAN.md` §6.1, Spec Page 4 §4.5 |
| 3 | Auth | Get Session Profile | Fetches authenticated user identity, role, and linked profile ID. | Bearer JWT Header | `{ user: { id, mobile, role, accountStatus }, profile: Object }` | 401 (Missing/expired token), 403 (Account suspended) | `IMPLEMENTATION_PLAN.md` §6.1 |
| 4 | Profile | Create/Update Basic Profile | Sets display name, profile type, bio (max 500 chars), and city. | `name`, `profileType`, `bio`, `city` | `{ success: true, profile: Object }` | 400 (Validation failure, bio too long), 401 (Unauthorized) | `IMPLEMENTATION_PLAN.md` §5.2, Spec Page 1 §2 |
| 5 | Profile | Claim/Change Username | Sets unique public profile handle/slug (lowercase alphanumeric + hyphens). | `username` (string) | `{ success: true, username: string, profileUrl: string }` | 400 (Invalid chars/reserved word), 409 (Username already taken) | `IMPLEMENTATION_PLAN.md` §6.2, Spec Page 7 §9.2 |
| 6 | Profile | Upload Profile Photo | Uploads and compresses profile avatar to Cloudinary/local storage. | Multipart image file (`image/jpeg`, `image/png`, max 5MB) | `{ photoUrl: string }` | 400 (File too large, unsupported mime type), 500 (Upload failure) | `IMPLEMENTATION_PLAN.md` §6.2, Spec Page 5 §6 |
| 7 | Profile | Toggle Publish Status | Transitions profile between `draft`, `published`, and `unpublished`. | `{ status: "published" \| "unpublished" }` | `{ success: true, status: string }` | 400 (Missing required fields for publishing like name/handle) | `IMPLEMENTATION_PLAN.md` §5.2, Spec Page 6 §7 |
| 8 | Profile | Generate Profile QR Code | Generates high-res QR code image pointing to public web profile URL. | `profileId` (from session or query) | `{ qrCodeUrl: string, shareUrl: string }` | 404 (Profile not found), 500 (Generation error) | `IMPLEMENTATION_PLAN.md` §6.2, Spec Page 7 §9.3 |
| 9 | Profile | Update Privacy Controls | Configures showPhone, showEmail, showWhatsapp, and allowDiscovery flags. | `{ contactDetails: { showPhone, showEmail, showWhatsapp }, allowDiscovery: boolean }` | `{ success: true, privacy: Object }` | 400 (Invalid boolean types), 401 (Unauthorized) | `IMPLEMENTATION_PLAN.md` §6.2, Spec Page 7 §10 |
| 10 | Sections | Add Profile Section | Appends a structured section (About, Experience, Education, Skills, Services, Achievements, Photos). | `{ type, title, content: Object, visibility: "public" \| "profile-only" \| "private" }` | `{ success: true, section: Object }` | 400 (Invalid section type or malformed content schema) | `IMPLEMENTATION_PLAN.md` §5.3, Spec Page 5 §5 |
| 11 | Sections | Get Profile Sections | Retrieves all active sections belonging to the profile, ordered by `order` field. | `profileId` (optional if authenticated) | `[ { id, type, title, content, order, visibility } ]` | 404 (Profile not found) | `IMPLEMENTATION_PLAN.md` §6.3 |
| 12 | Sections | Update Section | Modifies title, content, or visibility of a specific section. | Section ID in path, updated `{ title, content, visibility }` | `{ success: true, section: Object }` | 403 (Not section owner), 404 (Section not found) | `IMPLEMENTATION_PLAN.md` §6.3 |
| 13 | Sections | Delete Section | Deletes a section record from the profile. | Section ID in path | `{ success: true, message: "Section deleted" }` | 403 (Not owner), 404 (Section not found) | `IMPLEMENTATION_PLAN.md` §6.3 |
| 14 | Sections | Batch Reorder Sections | Updates the display sequence `order` of multiple sections simultaneously. | `[ { id: string, order: number } ]` | `{ success: true, message: "Order updated" }` | 400 (Mismatched IDs), 403 (Not owner) | `IMPLEMENTATION_PLAN.md` §6.3 |
| 15 | Reels | Request Upload Pre-Signed URL | Generates direct upload URL/signature for video asset. | `{ fileName, mimeType, sizeBytes }` | `{ uploadUrl: string, mediaId: string, publicUrl: string }` | 400 (File exceeds maximum size, e.g. >100MB), 401 (Unauthorized) | `IMPLEMENTATION_PLAN.md` §6.4, Spec Page 5 §6 |
| 16 | Reels | Confirm & Publish Reel | Persists reel metadata after video upload succeeds, initiates transcoding. | `{ videoUrl, thumbnailUrl, caption, durationSeconds, visibility }` | `{ success: true, reel: Object }` | 400 (Duration > 60s or caption > 300 chars), 401 (Unauthorized) | `IMPLEMENTATION_PLAN.md` §6.4, Spec Page 5 §5.1 |
| 17 | Reels | Public Feed (Reels Home) | Fetches paginated active public reels for vertical swipe video feed (Guest accessible). | Query params: `cursor` (last reel ID), `limit` (default 10) | `{ reels: [ { id, videoUrl, thumbnailUrl, caption, viewsCount, creator: { name, username, photoUrl } } ], nextCursor: string }` | 400 (Invalid cursor format) | `IMPLEMENTATION_PLAN.md` §6.4, Spec Page 2 §4.2 |
| 18 | Reels | Creator's My Reels | Retrieves all reels published by the authenticated user, including private ones. | Query params: `page`, `limit` | `{ reels: [ ReelObject ], total: number }` | 401 (Unauthorized) | `IMPLEMENTATION_PLAN.md` §6.4, Spec Page 2 §4.4 |
| 19 | Reels | Update Reel Visibility | Toggles reel visibility between `public`, `profile-only`, and `private`. | Reel ID, `{ visibility: string }` | `{ success: true, visibility: string }` | 403 (Not owner), 404 (Reel not found) | `IMPLEMENTATION_PLAN.md` §6.4 |
| 20 | Reels | Delete Reel | Soft deletes or permanently archives a reel. | Reel ID in path | `{ success: true, message: "Reel removed" }` | 403 (Not owner), 404 (Reel not found) | `IMPLEMENTATION_PLAN.md` §6.4 |
| 21 | Reels | Record Reel View | Increments the view counter atomically on video playback. | Reel ID in path, optional client session token | `{ success: true, viewsCount: number }` | 404 (Reel not found), 429 (Spam view throttle: 1 per IP/session per 30s) | `IMPLEMENTATION_PLAN.md` §6.4, Spec Page 2 §4.2 |
| 22 | Discovery | Phone Number Discovery | Searches for a profile by exact mobile number with opt-in privacy check. | `{ mobile: "+919876543210" }` | `{ profile: { name, username, photoUrl } }` (Never reveals phone number itself!) | 404 ("Profile not found" if unregistered OR if `allowDiscovery=false`), 429 (Rate limit: 5/min) | `IMPLEMENTATION_PLAN.md` §6.5, Spec Page 7 §9.1 |
| 23 | Web | Public Profile Viewer | Public browser-accessible profile renderer (`/:username`). | Username slug in URL route | `{ profile: Object, sections: [ Section ], publicReels: [ Reel ] }` | 404 (Profile not found or unpublished) | `IMPLEMENTATION_PLAN.md` §6.5, Spec Page 6 §8 |
| 24 | Moderation | Report Profile or Reel | Flags content for administrative review. | `{ targetType: "profile" \| "reel", targetId: string, reason: string }` | `{ success: true, reportId: string, message: "Report submitted" }` | 400 (Missing target/reason), 404 (Target not found) | `IMPLEMENTATION_PLAN.md` §5.6, Spec Page 8 §13 |
| 25 | Admin | Moderation Queue | Lists reported profiles and reels with filters (`pending`, `resolved`). | Query params: `status`, `page`, `limit` | `{ reports: [ ReportObject ], total: number }` | 401 (Unauthorized), 403 (Requires Admin role) | `IMPLEMENTATION_PLAN.md` §6.6, Spec Page 8 §13 |
| 26 | Admin | Moderation Takedown/Action | Takes action on a report: dismiss, takedown reel, or suspend user. | Report ID, `{ action: "takedown" \| "suspension" \| "dismiss", adminNotes: string }` | `{ success: true, report: Object }` | 403 (Non-admin), 404 (Report not found) | `IMPLEMENTATION_PLAN.md` §6.6, Spec Page 8 §13 |
| 27 | Admin | Platform Metrics Overview | Provides counters for total users, active profiles, reel count, reports. | None | `{ metrics: { totalUsers, activeProfiles, publishedReels, pendingReports, storageUsageBytes } }` | 403 (Requires Admin role) | `IMPLEMENTATION_PLAN.md` §6.6, Spec Page 8 §13 |
| 28 | Admin | User Management & Status | Lists users with search/filter; allows suspending or restoring accounts. | Query params: `search`, `status`, `page`, `limit` | `{ users: [ UserObject ], total: number }` | 403 (Requires Admin role) | `IMPLEMENTATION_PLAN.md` §6.6, Spec Page 8 §13 |
| 29 | Audit | Audit Log Recording | Internal service logging every admin action, user status change, and takedown. | `{ actorId, action, targetType, targetId, details, ipAddress, userAgent }` | `{ auditId: string, loggedAt: Date }` | 500 (Persistence failure logged to console) | Prompt Requirement 2, Spec Page 8 §13 |

---

## Section B: Edge Cases & Boundary Scenarios

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Phone Discovery | Mobile number exists in DB, but owner set `allowDiscovery = false` | Returns HTTP 404 `{ message: "Profile not found" }` with timing identical to non-existent number. Prevents phone number registration enumeration. |
| 2 | Phone Discovery | Mobile number does not exist in DB at all | Returns HTTP 404 `{ message: "Profile not found" }` with identical payload structure. |
| 3 | Phone Discovery | Rapid consecutive lookups (>5 queries in 60s from same IP) | Returns HTTP 429 `{ error: "Too many lookup attempts. Please wait before trying again." }`. |
| 4 | Phone Discovery | Input phone number in non-standard format (e.g. `09876543210` or `98765-43210`) | Backend normalizes to E.164 standard (`+919876543210`) before hashing and querying. |
| 5 | Username Slug | User inputs uppercase letters, spaces, or symbols: `Santosh @ Pune!` | Sanitized/slugified to `santosh-pune` or rejected with 400 if invalid characters cannot be mapped. |
| 6 | Username Slug | User attempts to claim reserved slugs (`admin`, `api`, `feed`, `login`, `settings`) | Returns HTTP 400 `{ error: "Username is reserved and cannot be claimed." }`. |
| 7 | Username Slug | User changes existing username after sharing links | Existing profile redirects or keeps historical slug mapping; old username is reserved or safely transitioned. |
| 8 | Reels Home Feed | Unauthenticated guest user launches mobile application | Returns HTTP 200 with public active reels list; player streams video without prompting for login or blocking UI. |
| 9 | Reels Home Feed | Reel has status `taken_down` or creator user account is `suspended` | Excluded by MongoDB query filter (`{ status: 'active', visibility: 'public' }`); immediately disappears from feed. |
| 10 | Reel Upload | User uploads video longer than configured max duration (>60 seconds) | Client trimmers enforce 60s limit; backend API rejects confirm with HTTP 400 `{ error: "Video exceeds maximum duration limit of 60 seconds." }`. |
| 11 | Reel Upload | User uploads corrupted or non-video file format (e.g. `.exe`, `.pdf`) | Mime type validation rejects upload with HTTP 400 / 422 `{ error: "Unsupported media format. Only MP4 and MOV videos are accepted." }`. |
| 12 | Reel Views | User plays video on repeat or sends rapid view increments via script | View increment endpoint enforces rate limiting / debouncing (maximum 1 view recorded per 30 seconds per unique IP/session). |
| 13 | Profile Sections | User reorders sections with missing or duplicate IDs in payload | Validates array contains exact set of owned section IDs; returns 400 on mismatched length or invalid IDs. |
| 14 | Profile Sections | Section content schema differs across types (Skills vs Experience) | Mongoose schema validates structured sub-fields (e.g., Skills requires string array; Experience requires `{ role, organization, start, end }`). |
| 15 | Public Web Profile | External visitor accesses unpublished profile (`status = 'draft'` or `'unpublished'`) | Returns HTTP 404 `{ error: "Profile is not publicly available." }`. |
| 16 | Minor Protection | User account flagged with `ageConsent.isAdult = false` | System forces `allowDiscovery = false` and disables changing it to `true`; hides sensitive contact fields by policy. |
| 17 | Moderation | Admin executes user suspension | User's `accountStatus` is set to `suspended`, linked profile `status` set to `unpublished`, all reels set to `taken_down`, and active JWT sessions are invalidated. |

---

## Section C: Data Models, Schemas & Persistence Requirements

### 1. User Model (`User.js`)
- **Collection:** `users`
- **Fields:**
  - `_id`: ObjectId (Primary Key)
  - `mobile`: String, required, unique, indexed (Normalized E.164, e.g. `+919876543210`)
  - `countryCode`: String, default `+91`
  - `isVerified`: Boolean, default `false`
  - `role`: String, enum: `['user', 'moderator', 'admin']`, default `'user'`
  - `accountStatus`: String, enum: `['active', 'suspended', 'deactivated']`, default `'active'`, indexed
  - `ageConsent`: Object:
    - `isAdult`: Boolean, default `true`
    - `guardianConsent`: Boolean, default `false`
  - `createdAt`: Date, default `Date.now`
  - `updatedAt`: Date, default `Date.now`
- **Indexes:**
  - `{ mobile: 1 }` (Unique)
  - `{ accountStatus: 1 }`

### 2. Profile Model (`Profile.js`)
- **Collection:** `profiles`
- **Fields:**
  - `_id`: ObjectId (Primary Key)
  - `userId`: ObjectId, ref `'User'`, required, unique, indexed
  - `name`: String, required, trim: true, maxlength: 100
  - `username`: String, required, unique, lowercase: true, trim: true, indexed (Regex: `^[a-z0-9_-]{3,30}$`)
  - `photoUrl`: String, default `''`
  - `profileType`: String, enum: `['Personal', 'Student', 'Sportsperson', 'Teacher', 'Professional', 'Freelancer', 'ServiceProvider', 'SmallBusiness']`, default `'Personal'`
  - `bio`: String, maxlength: 500, default `''`
  - `city`: String, default `''`
  - `status`: String, enum: `['draft', 'published', 'unpublished']`, default `'draft'`, indexed
  - `completionPercentage`: Number, default 20, min: 0, max: 100
  - `qrCodeUrl`: String, default `''`
  - `socialLinks`: Array of Objects:
    - `platform`: String, enum: `['instagram', 'youtube', 'facebook', 'linkedin', 'twitter', 'website']`
    - `url`: String
  - `contactDetails`: Object:
    - `phone`: String, default `''`
    - `whatsapp`: String, default `''`
    - `email`: String, default `''`
    - `showPhone`: Boolean, default `false`
    - `showWhatsapp`: Boolean, default `false`
    - `showEmail`: Boolean, default `false`
  - `createdAt`: Date, default `Date.now`
  - `updatedAt`: Date, default `Date.now`
- **Indexes:**
  - `{ username: 1 }` (Unique)
  - `{ userId: 1 }` (Unique)
  - `{ status: 1 }`

### 3. ProfileSection Model (`Section.js` / `ProfileSection.js`)
- **Collection:** `sections`
- **Fields:**
  - `_id`: ObjectId (Primary Key)
  - `profileId`: ObjectId, ref `'Profile'`, required, indexed
  - `type`: String, enum: `['about', 'experience', 'education', 'skills', 'services', 'achievements', 'photos']`, required
  - `title`: String, required, trim: true
  - `content`: Mixed (Schema-validated based on `type`):
    - *experience*: `{ role: String, organization: String, startDate: Date, endDate: Date, isCurrent: Boolean, description: String }`
    - *education*: `{ qualification: String, institution: String, year: String, grade: String }`
    - *skills*: `[ String ]` (Array of skill tags)
    - *services*: `[ { name: String, description: String, priceText: String } ]`
    - *achievements*: `[ { title: String, date: String, description: String, certificateUrl: String } ]`
    - *photos*: `[ { url: String, caption: String, order: Number } ]`
  - `order`: Number, default: 0
  - `visibility`: String, enum: `['public', 'profile-only', 'private']`, default `'public'`
  - `createdAt`: Date, default `Date.now`
  - `updatedAt`: Date, default `Date.now`
- **Indexes:**
  - `{ profileId: 1, order: 1 }`

### 4. Reel Model (`Reel.js`)
- **Collection:** `reels`
- **Fields:**
  - `_id`: ObjectId (Primary Key)
  - `profileId`: ObjectId, ref `'Profile'`, required, indexed
  - `videoUrl`: String, required
  - `thumbnailUrl`: String, required
  - `caption`: String, maxlength: 300, default `''`
  - `durationSeconds`: Number, required, max: 60
  - `visibility`: String, enum: `['public', 'profile-only', 'private']`, default `'public'`, indexed
  - `status`: String, enum: `['active', 'flagged', 'taken_down']`, default `'active'`, indexed
  - `viewsCount`: Number, default: 0
  - `likesCount`: Number, default: 0
  - `createdAt`: Date, default `Date.now`, indexed
  - `updatedAt`: Date, default `Date.now`
- **Indexes:**
  - `{ status: 1, visibility: 1, createdAt: -1 }` (Compound index for public feed)
  - `{ profileId: 1, createdAt: -1 }` (Creator profile reels)

### 5. ReelEngagement Model (`ReelEngagement.js`)
- **Collection:** `reel_engagements`
- **Fields:**
  - `_id`: ObjectId (Primary Key)
  - `reelId`: ObjectId, ref `'Reel'`, required, indexed
  - `viewerId`: ObjectId, ref `'User'`, default null (supports guest viewers)
  - `viewerSession`: String (Client session / IP hash for anonymous rate limiting)
  - `eventType`: String, enum: `['view', 'like', 'share']`, required
  - `timestamp`: Date, default `Date.now`, index: { expires: '30d' }
- **Indexes:**
  - `{ reelId: 1, eventType: 1 }`
  - `{ reelId: 1, viewerSession: 1, timestamp: -1 }`

### 6. ProfileLookup Model (`ProfileLookup.js`)
- **Collection:** `profile_lookups`
- **Fields:**
  - `_id`: ObjectId (Primary Key)
  - `hashedPhone`: String, required, unique, indexed (HMAC-SHA256 salted hash of normalized phone number)
  - `profileId`: ObjectId, ref `'Profile'`, required, indexed
  - `allowDiscovery`: Boolean, default `false`, indexed
  - `updatedAt`: Date, default `Date.now`
- **Indexes:**
  - `{ hashedPhone: 1 }` (Unique)
  - `{ allowDiscovery: 1 }`

### 7. Report Model (`Report.js`)
- **Collection:** `reports`
- **Fields:**
  - `_id`: ObjectId (Primary Key)
  - `targetType`: String, enum: `['profile', 'reel']`, required, indexed
  - `targetId`: ObjectId, required, indexed
  - `reporterId`: ObjectId, ref `'User'`, default null
  - `reason`: String, required, maxlength: 500
  - `status`: String, enum: `['pending', 'investigating', 'resolved', 'dismissed']`, default `'pending'`, indexed
  - `adminNotes`: String, default `''`
  - `actionTaken`: String, enum: `['none', 'warning', 'takedown', 'suspension']`, default `'none'`
  - `createdAt`: Date, default `Date.now`, indexed
  - `resolvedAt`: Date
- **Indexes:**
  - `{ status: 1, createdAt: -1 }`
  - `{ targetType: 1, targetId: 1 }`

### 8. AuditLog Model (`AuditLog.js`)
- **Collection:** `audit_logs`
- **Fields:**
  - `_id`: ObjectId (Primary Key)
  - `actorId`: ObjectId, ref `'User'`, required, indexed (Admin or system agent performing action)
  - `action`: String, enum: `['user_suspend', 'user_activate', 'reel_takedown', 'reel_restore', 'report_resolve', 'report_dismiss', 'privacy_override']`, required, indexed
  - `targetType`: String, enum: `['User', 'Profile', 'Reel', 'Report']`, required
  - `targetId`: ObjectId, required, indexed
  - `ipAddress`: String, default `''`
  - `userAgent`: String, default `''`
  - `details`: Object (Previous state, modified fields, rationale notes)
  - `createdAt`: Date, default `Date.now`, indexed
- **Indexes:**
  - `{ actorId: 1, createdAt: -1 }`
  - `{ targetType: 1, targetId: 1, createdAt: -1 }`

---

## Section D: REST API Endpoints Specification

### 1. Authentication & Session (`/api/auth`)

#### `POST /api/auth/send-otp`
- **Auth:** Public
- **Rate Limit:** 3 requests per 10 minutes per IP/mobile
- **Request Body:**
  ```json
  {
    "mobile": "+919876543210"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "OTP sent successfully",
      "expiresInSeconds": 300
    }
    ```
  - `400 Bad Request`: `{ "error": "Invalid phone number format. Must be E.164 compliant." }`
  - `429 Too Many Requests`: `{ "error": "Rate limit exceeded. Try again in 10 minutes." }`

#### `POST /api/auth/verify-otp`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "mobile": "+919876543210",
    "otp": "123456"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "token": "jwt_access_token_string",
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "mobile": "+919876543210",
        "role": "user"
      },
      "profile": {
        "id": "60d0fe4f5311236168a109cb",
        "username": "santosh",
        "status": "published",
        "isComplete": true
      }
    }
    ```
  - `400 Bad Request`: `{ "error": "Invalid or expired OTP." }`
  - `403 Forbidden`: `{ "error": "User account has been suspended." }`

#### `GET /api/auth/me`
- **Auth:** Bearer JWT required
- **Responses:**
  - `200 OK`: Returns authenticated user & profile snapshot.
  - `401 Unauthorized`: Missing or invalid token.

---

### 2. Profile Management (`/api/profile`)

#### `GET /api/profile/me`
- **Auth:** Bearer JWT required
- **Response `200 OK`:** Full profile document including unpublished drafts, sections, and privacy settings.

#### `PUT /api/profile/basic`
- **Auth:** Bearer JWT required
- **Request Body:**
  ```json
  {
    "name": "Santosh Bhalerao",
    "profileType": "Professional",
    "bio": "Full-stack cloud architect building scalable consumer apps.",
    "city": "Pune"
  }
  ```
- **Response `200 OK`:** Updated profile object with updated completion percentage.

#### `PUT /api/profile/username`
- **Auth:** Bearer JWT required
- **Request Body:**
  ```json
  {
    "username": "santosh-b"
  }
  ```
- **Response `200 OK`:** `{ "success": true, "username": "santosh-b", "profileUrl": "https://myprofile.app/santosh-b" }`
- **Errors:** `400 Bad Request` (Invalid syntax), `409 Conflict` (`"Username already registered"`).

#### `POST /api/profile/photo`
- **Auth:** Bearer JWT required
- **Request Body:** Multipart `form-data` with field `photo`
- **Response `200 OK`:** `{ "photoUrl": "https://res.cloudinary.com/.../avatar.jpg" }`

#### `POST /api/profile/publish`
- **Auth:** Bearer JWT required
- **Request Body:** `{ "status": "published" }` or `{ "status": "unpublished" }`
- **Response `200 OK`:** `{ "success": true, "status": "published" }`

#### `GET /api/profile/qr`
- **Auth:** Bearer JWT required (or public for published profiles)
- **Response `200 OK`:** `{ "qrCodeUrl": "https://cdn.myprofile.app/qr/santosh.png", "targetUrl": "https://myprofile.app/santosh" }`

#### `PUT /api/profile/privacy`
- **Auth:** Bearer JWT required
- **Request Body:**
  ```json
  {
    "contactDetails": {
      "showPhone": false,
      "showWhatsapp": true,
      "showEmail": true
    },
    "allowDiscovery": true
  }
  ```
- **Response `200 OK`:** `{ "success": true, "allowDiscovery": true }`

---

### 3. Profile Sections CRUD (`/api/profile/sections`)

#### `GET /api/profile/sections`
- **Auth:** Bearer JWT required
- **Response `200 OK`:** Array of owned sections sorted by `order ASC`.

#### `POST /api/profile/sections`
- **Auth:** Bearer JWT required
- **Request Body:**
  ```json
  {
    "type": "experience",
    "title": "Senior Solutions Architect",
    "content": {
      "role": "Lead Architect",
      "organization": "TechCorp Pune",
      "startDate": "2022-01-01",
      "isCurrent": true,
      "description": "Led mobile platform engineering."
    },
    "visibility": "public"
  }
  ```
- **Response `201 Created`:** Created Section document.

#### `PUT /api/profile/sections/:id`
- **Auth:** Bearer JWT required
- **Request Body:** Updated `{ title, content, visibility }`
- **Response `200 OK`:** Updated Section document.

#### `DELETE /api/profile/sections/:id`
- **Auth:** Bearer JWT required
- **Response `200 OK`:** `{ "success": true, "message": "Section deleted" }`

#### `PUT /api/profile/sections/reorder`
- **Auth:** Bearer JWT required
- **Request Body:**
  ```json
  {
    "orders": [
      { "id": "60d0fe4f5311236168a109d1", "order": 0 },
      { "id": "60d0fe4f5311236168a109d2", "order": 1 }
    ]
  }
  ```
- **Response `200 OK`:** `{ "success": true, "message": "Reorder applied successfully" }`

---

### 4. Reels Management (`/api/reels`)

#### `GET /api/reels/feed`
- **Auth:** Public (Guest accessible)
- **Query Params:** `cursor` (last reel ID string), `limit` (number, default 10, max 25)
- **Response `200 OK`:**
  ```json
  {
    "reels": [
      {
        "_id": "60d0fe4f5311236168a109e1",
        "videoUrl": "https://cdn.myprofile.app/videos/reel1.mp4",
        "thumbnailUrl": "https://cdn.myprofile.app/thumbs/reel1.jpg",
        "caption": "Building our new mobile workspace! #coding",
        "durationSeconds": 45,
        "viewsCount": 1420,
        "likesCount": 89,
        "creator": {
          "id": "60d0fe4f5311236168a109cb",
          "name": "Santosh Bhalerao",
          "username": "santosh",
          "photoUrl": "https://cdn.myprofile.app/avatars/santosh.jpg"
        }
      }
    ],
    "nextCursor": "60d0fe4f5311236168a109e1",
    "hasMore": true
  }
  ```

#### `POST /api/reels/upload-url`
- **Auth:** Bearer JWT required
- **Request Body:** `{ "fileName": "reel.mp4", "mimeType": "video/mp4", "sizeBytes": 15420000 }`
- **Response `200 OK`:** `{ "uploadUrl": "https://api.cloudinary.com/v1_1/...", "mediaId": "media_uuid", "publicUrl": "..." }`

#### `POST /api/reels/confirm`
- **Auth:** Bearer JWT required
- **Request Body:**
  ```json
  {
    "videoUrl": "https://cdn.myprofile.app/videos/reel1.mp4",
    "thumbnailUrl": "https://cdn.myprofile.app/thumbs/reel1.jpg",
    "caption": "Engineering workshop day!",
    "durationSeconds": 30,
    "visibility": "public"
  }
  ```
- **Response `201 Created`:** Reel record created and published.

#### `GET /api/reels/my-reels`
- **Auth:** Bearer JWT required
- **Response `200 OK`:** Array of all reels created by the user (including profile-only and private).

#### `PUT /api/reels/:id/visibility`
- **Auth:** Bearer JWT required (Owner only)
- **Request Body:** `{ "visibility": "profile-only" }`
- **Response `200 OK`:** `{ "success": true, "visibility": "profile-only" }`

#### `DELETE /api/reels/:id`
- **Auth:** Bearer JWT required (Owner or Admin)
- **Response `200 OK`:** `{ "success": true, "message": "Reel deleted" }`

#### `POST /api/reels/:id/view`
- **Auth:** Public
- **Rate Limit:** 1 view per 30s per session/IP
- **Response `200 OK`:** `{ "success": true, "viewsCount": 1421 }`

---

### 5. Discovery & Public Profile (`/api/discovery`, `/api/public`)

#### `POST /api/discovery/phone-lookup`
- **Auth:** Authenticated User
- **Rate Limit:** Max 5 queries per minute per user/IP
- **Request Body:**
  ```json
  {
    "mobile": "+919876543210"
  }
  ```
- **Response `200 OK` (Only if user exists AND `allowDiscovery: true`):**
  ```json
  {
    "found": true,
    "profile": {
      "name": "Santosh Bhalerao",
      "username": "santosh",
      "photoUrl": "https://cdn.myprofile.app/avatars/santosh.jpg",
      "profileType": "Professional"
    }
  }
  ```
  *(Crucial: Phone number itself is NEVER returned in the response!)*
- **Response `404 Not Found` (If number not registered OR `allowDiscovery: false`):**
  ```json
  {
    "found": false,
    "message": "No profile found with this mobile number."
  }
  ```
- **Response `429 Too Many Requests`:**
  ```json
  {
    "error": "Too many lookup attempts. Please wait before trying again."
  }
  ```

#### `GET /api/public/profile/:username`
- **Auth:** Public
- **Response `200 OK`:**
  ```json
  {
    "profile": {
      "name": "Santosh Bhalerao",
      "username": "santosh",
      "photoUrl": "...",
      "profileType": "Professional",
      "bio": "...",
      "city": "Pune",
      "qrCodeUrl": "...",
      "socialLinks": [ ... ],
      "contactDetails": {
        "showWhatsapp": true,
        "whatsapp": "+919876543210"
      }
    },
    "sections": [ ... ],
    "reels": [ ... ]
  }
  ```
- **Response `404 Not Found`:** `{ "error": "Profile not found or is currently private." }`

---

### 6. Reports & Moderation (`/api/reports`, `/api/admin`)

#### `POST /api/reports`
- **Auth:** Bearer JWT required (or Public with session)
- **Request Body:**
  ```json
  {
    "targetType": "reel",
    "targetId": "60d0fe4f5311236168a109e1",
    "reason": "Inappropriate or misleading content."
  }
  ```
- **Response `201 Created`:** `{ "success": true, "reportId": "...", "message": "Report logged." }`

#### `GET /api/admin/metrics`
- **Auth:** Admin role required (`role: 'admin'`)
- **Response `200 OK`:** Platform metrics overview.

#### `GET /api/admin/reports`
- **Auth:** Admin role required
- **Query Params:** `status` (`pending`, `resolved`, `dismissed`), `page`, `limit`
- **Response `200 OK`:** Paginated reports list.

#### `PUT /api/admin/reports/:id/action`
- **Auth:** Admin role required
- **Request Body:**
  ```json
  {
    "action": "takedown",
    "adminNotes": "Violates community guidelines."
  }
  ```
- **Response `200 OK`:** `{ "success": true, "actionTaken": "takedown" }`
- **Side Effect:** Automatically creates entry in `AuditLog` collection.

#### `PUT /api/admin/users/:id/status`
- **Auth:** Admin role required
- **Request Body:** `{ "status": "suspended", "reason": "Severe policy violation" }`
- **Response `200 OK`:** `{ "success": true, "accountStatus": "suspended" }`
- **Side Effect:** Automatically creates entry in `AuditLog` collection.

---

## Section E: Privacy & Security Rules

### 1. Mobile Discovery Salted Hash & Anti-Enumeration Architecture
- **HMAC Hashing Function:**
  $$\text{hashedPhone} = \text{crypto.createHmac}('sha256', \text{process.env.PHONE\_HASH\_SALT}).\text{update}(\text{normalizeE164}(mobile)).\text{digest}('hex')$$
- **Zero Information Leakage:**
  - If a user exists in the `users` collection but has `allowDiscovery = false` in `profile_lookups`, the query returns an identical HTTP 404 response payload:
    `{ "found": false, "message": "No profile found with this mobile number." }`
  - Database queries use constant-time execution patterns to prevent side-channel timing analysis that could reveal registration status.
- **Payload Sanitization:**
  - The lookup endpoint returns ONLY: `name`, `username`, `photoUrl`, `profileType`.
  - The mobile number is never echoed back in the response.
- **Anti-Enumeration Rate Limiting:**
  - Route-specific rate limiter: Maximum 5 phone lookup queries per 60-second sliding window per IP address and per user session.
  - Progressive delays applied for repeated lookups.

### 2. Authentication & Authorization Security
- **OTP Gateway Security:**
  - 6-digit cryptographically random OTP generated via `crypto.randomInt(100000, 999999)`.
  - Expiration TTL: 5 minutes (stored with TTL index in Redis or MongoDB).
  - Maximum 5 consecutive failed verification attempts before invalidating the OTP.
  - SMS Send cooldown: 60-second timer between OTP resends.
- **JWT Tokens:**
  - Signed with `process.env.JWT_SECRET` (minimum 256-bit entropy).
  - Payload contains `{ userId: ObjectId, role: string }`.
  - Expiration: Short-lived access tokens (24 hours).
- **Role-Based Access Control (RBAC):**
  - Roles: `user`, `moderator`, `admin`.
  - Admin endpoints guarded by `requireAdmin` middleware checking `req.user.role === 'admin'`.
  - Resource ownership guard: Verifies `req.user.id.toString() === resource.userId.toString()` on all Profile, Section, and Reel mutations.

### 3. Minors & Safety Compliance
- `ageConsent` schema flags minor accounts (`isAdult: false`).
- Minor accounts have `allowDiscovery` locked to `false` and cannot be toggled to `true`.
- Sensitive contact details (phone, exact address) are suppressed from public profiles for minor accounts.

---

## Section F: Traceability Matrix (Requirements to Technical Artifacts)

| Spec Requirement | Functional Need | Models Involved | API Endpoints | UI Component / View |
|---|---|---|---|---|
| R1. Backend Auth & Persistence | Mobile OTP & JWT Session | `User`, `Profile` | `/api/auth/send-otp`, `/api/auth/verify-otp` | `MobileLoginScreen`, `OtpVerificationScreen` |
| R1. Profile CRUD & Sections | Dynamic modular profile builder | `Profile`, `Section` | `/api/profile/*`, `/api/profile/sections/*` | `EditProfileScreen`, `ProfileSectionList`, `SectionCard` |
| R1. Reels Persistence & Views | Cursor pagination, view counts | `Reel`, `ReelEngagement` | `/api/reels/feed`, `/api/reels/:id/view` | `ReelsHomeScreen`, `ReelPlayerItem` |
| R1. Salted Phone Discovery | Zero-leak phone lookup | `ProfileLookup` | `/api/discovery/phone-lookup` | `PhoneLookupScreen` |
| R1. Moderation & Takedowns | Content reporting & takedowns | `Report`, `AuditLog` | `/api/reports`, `/api/admin/reports/*` | `ModerationQueueTable`, `ReportSubmissionSheet` |
| R2. Mobile Reels Feed | Guest vertical swipe | `Reel` | `/api/reels/feed` | `ReelsHomeScreen`, `ReelPlayerItem` |
| R2. My Profile Dashboard | Bottom navigation & status | `Profile`, `Reel` | `/api/profile/me`, `/api/reels/my-reels` | `MyProfileScreen`, `BottomTabNavigator` |
| R2. Reel Creator (`+`) | Video trim, cover, visibility | `Reel` | `/api/reels/upload-url`, `/api/reels/confirm` | `ReelCreatorModal`, `CameraCaptureScreen` |
| R3. Public Web Profile | `/:username` browser view | `Profile`, `Section`, `Reel` | `/api/public/profile/:username` | `PublicHeader`, `SectionCard`, `ReelGrid` |
| R3. Admin Web Panel | Reports & user management | `Report`, `User`, `AuditLog` | `/api/admin/*` | `MetricCard`, `ModerationQueueTable`, `UserFilterToolbar` |
| R4. Media Pipeline | Video transcoding & storage | `Reel`, `Profile` | `/api/reels/upload-url` | Storage Service (Cloudinary / Local Fallback) |
| R5. Verification Test Suites | End-to-end automated tests | All | All | Jest/Supertest backend tests, RTL web tests |
