# Engineering decisions and trade-offs

This document captures the reasoning behind the initial implementation, from problem framing through operational details.

## 1. Start with a narrow persona and workflow

The only stated user is an HR manager, so the first release is optimized for HR record lookup and maintenance rather than broad employee self-service. The main journey is: sign in, scan headline metrics, search/filter the directory, open a person, edit compensation, and retain a change record. This keeps the demo focused on the real spreadsheet pain.

## 2. Angular + Spring Boot

Angular aligns with the requested Java role and gives a coherent TypeScript component/service model. Spring Boot gives familiar Java layering, validation, a security filter chain, JDBC support, structured configuration, and test tooling. The UI is a static SPA so it can be deployed independently on Vercel; the Java API is stateless and deploys as a separate service.

## 3. Supabase Auth plus Postgres

Supabase supplies managed Postgres and email/password identity without inventing a password system. The frontend SDK owns the sign-in lifecycle. Spring validates the issued token on every protected call; it does not trust the browser's user object or accept an arbitrary ID. The database is reached from the backend over JDBC, rather than exposing salary tables directly through the Data API. This centralizes business rules and audit writes in one service.

## 4. JWT verification using JWKS

The backend uses Spring Security's resource-server JWT support and issuer-based discovery/JWKS verification, which allows key rotation without embedding a shared signing secret in source. The Supabase project should use asymmetric JWT signing keys. Do not publish server credentials. A production hardening item is an explicit allowed-issuer configuration, clock synchronization, and test coverage against real token fixtures from the target project's signing setup.

## 5. Salary as amount plus currency

A numeric amount alone is ambiguous across countries. Salary therefore stores a decimal amount and currency code. Dashboard sums and averages are grouped by currency and segment. No implicit FX conversion is performed, because it would create plausible-looking but incorrect totals. Add currency conversion only with a documented source, timestamp, and reporting-currency decision.

## 6. Decimal rather than floating point

Compensation is monetary, so Java uses `BigDecimal` and Postgres uses `numeric(14,2)`. Binary floating point is unsuitable for exact monetary storage and comparison. The UI formats values by selected currency where possible, but formatting is display logic rather than conversion.

## 7. Server-side pagination and allowlisted sorting

Even though 10,000 records may fit in memory, downloading them all wastes bandwidth and creates sluggish initial rendering. The endpoint caps page size at 100, performs filters and ordering in SQL, and validates sort keys rather than concatenating arbitrary client input into SQL. A future version could use keyset pagination if deep-offset performance becomes an issue.

## 8. Optimistic concurrency

An edit form can become stale while another HR user updates the same record. The `version` field is part of an update predicate. A stale change returns a conflict instead of silently overwriting another edit. This is a simple and inspectable choice suitable for the assessment.

## 9. Audit table in the update transaction

A salary change should be explainable later. The API writes the employee's new salary and an audit row in a single transaction; if the audit insert fails, the update rolls back. The audit row records actor subject from the validated token, time, old/new amount, currency, and reason. A production system should consider write-once controls and explicit retention/access policies.

## 10. Synthetic, deterministic seed data

The seed script creates 10,000 clearly synthetic records across plausible departments, roles, countries, currencies, and statuses. It is idempotent by employee number and does not create real people or credentials. Determinism makes screenshots, demos, and tests reproducible. Real employee information must never be committed as sample data.

## 11. Validation belongs in more than one layer

Angular forms give immediate feedback, but backend DTO validation remains authoritative because clients can be bypassed. Database constraints defend core invariants even if another writer is introduced later. The layers are intentionally overlapping for correctness, not redundant by accident.

## 12. Testing strategy

Unit tests cover salary domain validation and page/filter boundary behavior. Controller tests should verify response semantics and error mapping. Database integration tests should use an isolated Testcontainers database in a CI environment if Docker is available; the current project includes fast deterministic tests without requiring a hosted Supabase instance. Before production, add end-to-end sign-in-to-edit tests against a staging Supabase project.

## 13. Keep scope honest

The app does not calculate payroll, withhold tax, create payslips, convert currencies, or perform bulk imports. These are deliberate exclusions because the task is salary management and questions about compensation, not payroll processing. The deployment guide gives free-tier options but explicitly notes that provider free tiers and sleep/usage limits change.

## 14. AI-assisted development workflow

AI was used to draft scaffolding, tests, documentation, and repeatable infra assets. Important validation steps remain human-verifiable: read SQL before running, inspect security configuration, run the test suites, configure deployment secrets, and test the production Supabase token flow. The commit sequence is intended to preserve requirements, schema, backend, frontend, and deployment artifacts as reviewable steps instead of one opaque commit.

## 15. Known limitations before real production use

- A single HR persona is authenticated, but all authenticated users are not differentiated by role yet.
- Multi-tenant isolation and row-level organization authorization need to be added before supporting multiple organizations.
- JWT JWKS verification requires asymmetric signing setup; verify this against the current Supabase project settings.
- The first UI iteration is focused on core management flows, not accessibility audit certification or mobile-native layouts.
- Full browser-driven E2E testing and a live deployment need to run in the candidate's deployment accounts.
