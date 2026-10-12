# DISPATCH: Milestone 1 Explorer 3 (Auth Engine, OTP Adapter & Security)

## Identity
- Archetype: teamwork_preview_explorer
- Working Directory: e:\Job demoapp\.agents\teamwork\explorer_m1_3
- Parent Orchestrator: orchestrator_1 (Conversation ID: db4ab9ec-ee75-4233-b50c-743cb20b0522)

## Mission
Investigate and design the Authentication Engine, OTP verification service, and security middlewares for Milestone 1.
Areas to design:
1. `otp.service.js`: Pluggable OTP adapter (mock/console for dev & test, SMS provider interface for production). Generation of 6-digit numeric OTP, TTL (5 mins), attempts throttle (max 5 fails), resend cooldown (60s).
2. Auth Controllers & Routes:
   - `POST /api/auth/send-otp`: validates phone, normalizes to E.164, dispatches OTP.
   - `POST /api/auth/verify-otp`: verifies OTP, finds/creates User, creates initial Profile if missing, signs JWT.
   - `GET /api/auth/me`: decodes token, checks active status, returns user & profile summary.
3. Middlewares:
   - `auth.middleware.js`: Bearer token extractor, JWT verification, user lookup, suspended account guard (`accountStatus !== 'suspended'`), RBAC role check (`requireRole`).
   - Rate limiting: anti-abuse on OTP requests.
4. Unit and Integration tests using Jest and Supertest (`tests/auth.test.js`).

## Deliverable
Write your recommendations to `e:\Job demoapp\.agents\teamwork\explorer_m1_3\handoff.md`.
Notify orchestrator_1 when finished.
