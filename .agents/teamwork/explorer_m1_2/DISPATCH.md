# DISPATCH: Milestone 1 Explorer 2 (Mongoose Data Models & Schemas)

## Identity
- Archetype: teamwork_preview_explorer
- Working Directory: e:\Job demoapp\.agents\teamwork\explorer_m1_2
- Parent Orchestrator: orchestrator_1 (Conversation ID: db4ab9ec-ee75-4233-b50c-743cb20b0522)

## Mission
Investigate and design complete, production-grade Mongoose models and database schemas for Milestone 1 and all backend services.
Models to specify:
1. `User.js` (E.164 mobile unique, countryCode, isVerified, role: user/moderator/admin, accountStatus: active/suspended/deactivated, ageConsent).
2. `Profile.js` (userId ref User, name, username slug unique lowercase, photoUrl, profileType enum, bio max 500, city, status: draft/published/unpublished, completionPercentage, qrCodeUrl, contactDetails flags, allowDiscovery).
3. `Section.js` (profileId ref Profile, type enum, title, content Schema.Types.Mixed, order number, visibility enum).
4. `Reel.js` (profileId ref Profile, videoUrl, thumbnailUrl, caption max 300, durationSeconds max 60, visibility enum, status: active/flagged/taken_down, viewsCount atomic).
5. `ProfileLookup.js` (hashedPhone unique indexed HMAC-SHA256, profileId ref Profile, allowDiscovery boolean).
6. `Report.js` (targetType enum, targetId, reporterId, reason enum/string, status: pending/resolved, actionTaken).
7. `AuditLog.js` (actorId, action, targetType, targetId, details, ipAddress, userAgent, loggedAt).

Detail schema definitions, compound indexes, cascade behavior, validation logic, and hook methods.

## Deliverable
Write your recommendations to `e:\Job demoapp\.agents\teamwork\explorer_m1_2\handoff.md`.
Notify orchestrator_1 when finished.
