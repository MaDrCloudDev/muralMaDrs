# muralMaDrs Plan

## Status
The Bun + TypeScript + Hono migration is complete.

## Current Priorities
1. Add automated test coverage
- Unit tests for validation and auth/session services.
- Integration tests for mural CRUD and review flows.

2. Add CI checks
- Run `bun run typecheck`, `bun run lint`, and `bun run build:css` in CI.
- Block merges on failing checks.

3. Seed and fixture workflow
- Add repeatable local seed scripts for mural/user/review test data.
- Document teardown and reseed steps.

4. Deployment hardening
- Add production smoke checks for database connectivity and static asset delivery.
- Add runtime error alerting/log forwarding.

## Deferred
- Full E2E browser test suite.
- Admin moderation tools.
