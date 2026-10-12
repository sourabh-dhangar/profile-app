# Orchestration Plan: MyProfile Full-Stack Platform

## Objectives
Deliver a production-ready, fully verified full-stack personal digital identity and short-video profile platform (MyProfile) meeting all specifications in `ORIGINAL_REQUEST.md` and `IMPLEMENTATION_PLAN.md`.

## Workflow Phases

### Phase 0: Survey & Discovery (Current)
- Spawn 3 Explorers/Spec Miners:
  1. Explorer 1: Repo inspection & current workspace setup (existing files, packages, configs, scripts).
  2. Spec Miner 2: Deep specification requirements & data model mapping (`IMPLEMENTATION_PLAN.md` & `ORIGINAL_REQUEST.md`).
  3. Spec Miner 3: Test infrastructure, test criteria, and verification strategy requirements.
- Aggregate findings into `PROJECT.md` at root workspace with Feature Inventory, Architecture, Milestones, and Interface Contracts.

### Phase 1: Dual Track Execution
- Track A: E2E Test Suite Track (`teamwork_preview_test_writer` / test orchestrator)
  - Define test infrastructure and runners
  - Implement Tier 1-4 tests (Feature, Boundary, Pairwise, Real-world scenarios)
  - Generate `TEST_READY.md`
- Track B: Core Implementation Track
  - Milestone 1: Backend Foundation, Database, Auth (Phone OTP & JWT), Privacy Lookup
  - Milestone 2: Profile Builder & Modular Sections API + Media Pipeline (Cloudinary/Local)
  - Milestone 3: Reels Video Feed API, Pagination, View Counting, Moderation/Admin Endpoints
  - Milestone 4: Mobile App (React Native Expo) - Reels Feed, Profile Dashboard, QR, Creation, Discovery
  - Milestone 5: Web App (React) - Public Profile Viewer (`/:username`), Admin Moderation Dashboard

### Phase 2: Integration & Review Cycle
- Run Explorer -> Worker -> Reviewer -> Challenger -> Auditor iteration loops for each milestone.
- Gate check strict AND: build passes, tests pass, reviewers approve, challengers approve, auditor clean.

### Phase 3: Final E2E Milestone & Adversarial Hardening
- Run 100% of E2E test suites (Tiers 1-4).
- Tier 5 Adversarial Coverage Hardening with Challengers.

### Phase 4: Final Handover
- Complete verification, produce summary report, and notify Sentinel via `send_message`.
