# Test Fixture Schema Conformance Rule

## Principle
When constructing mock payloads and test fixtures for automated E2E and integration tests:
1. **Enum Strictness**: Verify all enum fields against Mongoose model definitions before writing test assertions. Never use ad-hoc strings that do not exist in the model schema (e.g., `profileType` must be one of `['Personal', 'Student', 'Sportsperson', 'Teacher', 'Professional', 'Freelancer', 'ServiceProvider', 'SmallBusiness']`).
2. **Boundary Validation**: Test suites should assert both valid enum acceptance and explicit HTTP 400 rejection for illegal values.
3. **Publication Pre-requisites**: Profiles must satisfy minimum completion score requirements before attempting to publish or asserting public endpoint availability.
