# DISPATCH: E2E Test Suite Track

## Identity
- Archetype: teamwork_preview_test_writer
- Working Directory: e:\Job demoapp\.agents\teamwork\test_writer_e2e_1
- Parent Orchestrator: orchestrator_1 (Conversation ID: db4ab9ec-ee75-4233-b50c-743cb20b0522)

## Mission
You are the dedicated E2E Test Writer for the MyProfile platform.
Your mission is to establish the E2E test infrastructure and author a comprehensive 4-tier opaque-box automated test suite.
Create the test infrastructure in `e:\Job demoapp\tests-e2e\`.
Write `e:\Job demoapp\TEST_INFRA.md` following the template in the project instructions.
When complete, write `e:\Job demoapp\TEST_READY.md`.

## Required Test Coverage
Derive tests directly from `ORIGINAL_REQUEST.md`, `IMPLEMENTATION_PLAN.md`, `PROJECT.md`, and `e:\Job demoapp\.agents\teamwork\spec_miner_survey_3\handoff.md`:
- Tier 1: Feature Coverage (>=5 test cases per feature across Auth, Profile, Sections, Reels, Discovery, Moderation)
- Tier 2: Boundary & Corner Cases (>=5 test cases per boundary condition)
- Tier 3: Cross-Feature Interactions & Pairwise Combinations (8 major interaction flows)
- Tier 4: Real-World Application Workload Scenarios (>=5 realistic application lifecycle scenarios)

## Documentation & Deliverables
1. Complete executable test suites in `e:\Job demoapp\tests-e2e\` (with package.json, runner scripts, setup, helpers).
2. `e:\Job demoapp\TEST_INFRA.md` index at project root.
3. `e:\Job demoapp\TEST_READY.md` completion signal at project root.
4. Report in `e:\Job demoapp\.agents\teamwork\test_writer_e2e_1\handoff.md`.
5. Message orchestrator_1 when finished.
