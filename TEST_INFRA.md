# Test Infrastructure Specification — MyProfile Platform

## 1. Overview
The MyProfile automated test framework provides comprehensive end-to-end (E2E) testing against the live backend REST API, MongoDB data layer, and authentication mechanisms across 6 opaque-box tiers.

## 2. Directory Structure
```
tests-e2e/
├── package.json               # Test suite configuration
├── test-client.js             # Native Node.js HTTP client wrapper with JWT bearer support
├── tier1-feature-tests.js     # Tier 1: 18 Feature Coverage tests (Auth, Profile, Sections, Reels, Discovery, Moderation)
├── tier2-boundary-tests.js    # Tier 2: 8 Boundary & Corner Case tests (Validation, Limits, Privacy, RBAC)
├── tier3-flow-tests.js        # Tier 3: 10 Cross-Feature Lifecycle Flow tests (Onboarding, Moderation, Suspension)
├── tier4-workload-tests.js    # Tier 4: 12 Real-World Application Workload Scenarios (Portfolio, Scoring, Discovery, Admin)
├── tier5-enhancement-tests.js # Tier 5: 28 Advanced Enhancement tests (vCard, 5 Aesthetic Themes, Analytics & Route Precedence)
├── tier6-inquiry-tests.js     # Tier 6: 13 Direct Visitor Inquiries & Messaging tests (Public Inquiries, Status Lifecycle, Inbox)
└── run-all.js                 # Unified test aggregator & reporter
```

## 3. Test Coverage Breakdown

### Tier 1: Feature Coverage (18 Test Cases)
- **Health Check**: `GET /health` -> 200 OK
- **Authentication**:
  - `POST /api/v1/auth/request-otp` -> 200 success
  - Dev mode OTP bypass (`123456`) -> verified
  - `POST /api/v1/auth/verify-otp` -> 200 & JWT issue
  - `GET /api/v1/auth/me` -> 200 with normalized mobile
- **Profile Management**:
  - `PUT /api/v1/profiles/me` -> 200 username & bio update
  - `GET /api/v1/profiles/check-username/:slug` -> available check
  - `POST /api/v1/profiles/me/publish` -> published state transition
  - `GET /api/v1/profiles/:slug` -> public profile resolution
- **Modular Sections**:
  - `POST /api/v1/profiles/me/sections` -> add section block
  - `GET /api/v1/profiles/me/sections` -> list ordered sections
  - `PUT /api/v1/profiles/me/sections/:id` -> update section content
- **Phone Discovery**:
  - `PUT /api/v1/discovery/settings` -> toggle opt-in state
  - `POST /api/v1/discovery/search-by-phone` -> privacy-preserving lookup
- **Reels & Media**:
  - `POST /api/v1/reels` -> create short video post
  - `POST /api/v1/reels/:id/like` -> increment likes
  - `POST /api/v1/reels/:id/view` -> increment views
- **Moderation**:
  - `POST /api/v1/reports` -> submit content flag

### Tier 2: Boundary & Corner Cases (8 Test Cases)
- Empty mobile in request-otp -> 400 Bad Request
- Invalid OTP in verify-otp -> 400 Bad Request
- Reel duration > 60 seconds -> 400 Bad Request
- Duplicate username collision -> 409 Conflict
- Non-existent public profile -> 404 Not Found
- Phone lookup for opted-out user -> 404 Not Found (Anti-enumeration guarantee)
- Non-admin accessing admin endpoints -> 403 Forbidden
- Unauthenticated access to protected profile -> 401 Unauthorized

### Tier 3: Cross-Feature Lifecycle Flows (10 Test Cases)
- **Flow 1: Creator Onboarding & Publication**: Registration -> profile setup -> sections -> publish -> QR code generation -> public resolution.
- **Flow 2: Content Moderation & Takedown**: Reel creation -> viewer report -> admin review -> takedown action -> verified public 404 removal.
- **Flow 3: User Account Suspension**: Admin user ban -> token revocation check -> blocked 403 enforcement.

### Tier 4: Real-World Workload Scenarios (12 Test Cases)
- **Scenario 1: Rich Portfolio & Scoring**: Multi-section portfolio (skills, experience, projects, links) with automated profile completion scoring.
- **Scenario 2: Video Creator Batch Upload & Engagement**: Multi-reel publishing with high engagement (likes & views).
- **Scenario 3: Phone Discovery Privacy Lifecycle**: Anti-enumeration before opt-in -> verified match after opt-in -> mask re-application after opt-out.
- **Scenario 4: Community Moderation Escalation**: Flagging objectionable media -> queue management -> resolution.
- **Scenario 5: Admin Platform Metrics & Oversight**: Platform counters (users, profiles, reels, reports) and account listing.

### Tier 5: Advanced Enhancements (28 Test Cases)
- **Universal vCard (`.vcf`) Generation**:
  - `GET /api/v1/profiles/:username/vcard` -> 200 OK with `text/vcard` & attachment header.
  - RFC 6350 / vCard 3.0 specification compliance (`BEGIN:VCARD`, `FN`, `EMAIL`, `URL`, `END:VCARD`).
  - Privacy masking: strictly omits `TEL;` when `showPhone` is false.
  - Privacy reveal: outputs `TEL;` when `showPhone` is explicitly true.
  - 404 handling on non-existent or draft profiles.
- **Visual Aesthetic Themes**:
  - Theme configuration persistence on `PUT /api/v1/profiles/me`.
  - Public profile reflects configured theme.
  - Validates and allows all 5 curated themes (`default`, `dark-neon`, `minimalist-luxe`, `cyberpunk-emerald`, `sunset-gradient`).
  - Strict validation: rejects unknown theme with 400 Bad Request.
- **Privacy-Friendly Visitor Analytics**:
  - `POST /api/v1/profiles/:username/view` -> increments `totalViews` and daily aggregate.
  - `POST /api/v1/profiles/:username/click` -> increments `totalClicks` and itemizes link click counts.
  - `GET /api/v1/profiles/me/analytics` -> returns 7-day trend history (`dailyViews`/`recentViews`) and itemized `topLinks`/`linkClicks`.
  - Express route precedence verification (`/me/analytics` priority over parametric `/:username`).
  - Authenticated protection: rejects unauthenticated access with 401.

### Tier 6: Direct Visitor Inquiries & Messaging (13 Test Cases)
- **Public Inquiry Submission**:
  - `POST /api/v1/profiles/:username/inquiries` -> 201 Created with message verification.
  - Defaults to `unread` status and tracks timestamps.
  - Validation: 400 Bad Request on missing `name`, `email`, or `message`.
  - Draft/Non-existent profile protection: 404 Not Found.
- **Creator Inbox Management**:
  - `GET /api/v1/profiles/me/inquiries` -> 200 OK with message array and `unreadCount`.
  - Express route precedence verification (`/me/inquiries` prioritized over parametric `/:username`).
  - `PUT /api/v1/profiles/me/inquiries/:id/status` -> 200 OK transitions between `unread`, `read`, and `archived`.
  - Accurate `unreadCount` decrementing upon marking message as read.
  - Status query filtering (`?status=unread`, `?status=read`, `?status=archived`).
  - Validation: rejects invalid status string with 400 Bad Request.
  - Authenticated protection: rejects unauthenticated access with 401 Unauthorized.

## 4. Running the Tests
```bash
npm.cmd test
# or
node tests-e2e/run-all.js
```

## 5. Execution Summary
- **Total Test Cases Executed**: 89
- **Pass Rate**: 100% (89 Passed, 0 Failed)
- **Execution Time**: ~0.78 seconds
