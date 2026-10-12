# Testing Strategy and Quality Gates

## Principles

- Keep unit tests deterministic, fast, isolated, and explicit about the behavior under test.
- Use unit tests for domain validation and parameter bounds; use integration tests for SQL, transaction, security filter, and data constraints.
- Never claim a test passed unless the command output was observed.
- Treat the hosted smoke test as a separate environment validation, not a substitute for automated tests.

## Existing test files observed in the project snapshot

### Backend (JUnit 5 / Spring Boot Test / Mockito)

- `EmployeeServiceTest`: negative page rejected, page size over maximum rejected, unsupported status/sort/direction rejected, country code normalization, and validated query delegation.
- `SalaryUpdateRequestValidationTest`: valid salary with reason accepted; negative salary, more than two decimals, and too-short reason rejected.
- `ApiExceptionHandlerTest`: status error keeps HTTP status and reason.

### Frontend (Angular/Jasmine/Karma)

- `ApiService` specs: query/filter/pagination parameters are sent to API, and empty optional filters are omitted.
- `models.spec.ts`: salary amount remains paired with a currency property.
- `LoginComponent` spec: login screen instantiates and email/password inputs are present.

### CI workflow

`.github/workflows/ci.yml` defines a backend test job under Java 21 and a frontend build/test job under Node 22. It sets placeholder public build configuration for Angular so the build script can generate production environment data without adding production secrets to CI.

## Test commands

```bash
# Backend
cd backend
mvn -B test

# Frontend
cd frontend
npm ci
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

Angular test command may require a Chrome/Chromium browser in the runner; CI expects `ChromeHeadless` to be available on the hosted runner. Verify the job on the active repository rather than assuming.

## Essential missing or underrepresented tests before calling the submission complete

1. **JWT security integration:** no token, malformed token, expired token, wrong issuer/audience, valid allowlisted HR, valid non-allowlisted account.
2. **Repository integration:** real PostgreSQL schema and SQL query behavior for search/filter/sort/page count, duplicate identity, and result ordering.
3. **Salary transaction:** successful update creates exactly one audit row; no-op produces none; stale version returns 409; audit insert failure rolls back salary update.
4. **Controller/HTTP contract:** endpoint status codes and Problem Details response field names.
5. **Dashboard aggregation:** independently verify seeded fixture count and sums by currency, and verify terminated rows excluded from compensation aggregates.
6. **Angular auth interceptor/route guard:** token attaches only to API calls; no credentials leak to unrelated hosts; unauthenticated navigation redirects correctly.
7. **UI workflow/e2e:** login, search, create, salary edit, audit view, browser refresh, validation and empty/error states.
8. **Production config:** the actual Vercel API base includes `/api`; CORS allows the Vercel origin; Render datasource connects to Session Pooler with TLS.

## Test data design

- Use synthetic fixtures and reserved `.test` emails.
- Avoid calling live Supabase from unit tests.
- Use a disposable PostgreSQL database/Testcontainers for SQL integration tests if the assessment budget/time permits; alternatively use a dedicated non-production Supabase project for a manual staging pass.
- Keep expected data small and explicit in unit tests; use 10k seed only for data-volume/performance checks.

## Evidence status at artifact creation

The code repository includes the tests listed above and a CI workflow. In this artifact preparation, tests were inventoried from source but not executed. The user's local Spring process has started, Render reported its service live, and Vercel showed a ready deployment; however, browser evidence still contained an API HTTP 500. Therefore end-to-end deployed functionality is **not verified** and this pack must not be read as a green test report.
