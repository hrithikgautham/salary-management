# Implementation journal

This journal records the project's build sequence and the concrete decision points that shaped the current implementation. The architecture and trade-offs document explains the reasoning; this file provides a chronological walkthrough that can support the technical discussion.

## Step 1: Understand the problem before choosing features

The assessment names one persona, the HR manager, and one pain point, spreadsheet administration for 10,000 people in multiple countries. The requirements therefore prioritize employee search, current salary maintenance, salary history, and summary questions about compensation. Payroll computation and tax compliance are not necessary to prove this workflow and are explicitly deferred.

**Artifact:** `requirements.md` was committed before application implementation so reviewers can see that scope was framed in advance.

## Step 2: Set the component boundaries

Angular is the presentation layer, Spring Boot is the single business API, Supabase Auth is the identity provider, and Supabase Postgres is the persistent store. The browser never queries the salary tables directly. This creates a single place for validation, concurrency rules, and audit writes, while keeping the static website and API independently deployable.

**Artifact:** `architecture.md` contains the request path and data model; `api-contract.md` lists endpoints and errors.

## Step 3: Model monetary information with context

The employee record stores a decimal amount and an uppercase three-character currency code. Annual salary is stored as `numeric(14,2)` in Postgres and `BigDecimal` in Java. Currency is carried into every dashboard group. The app does not add USD, INR, EUR, and other denominations to make a single “global total”.

## Step 4: Decide what pagination means at 10,000 rows

Search, filters, count, ordering, and pagination are executed in SQL. The default page is 25 rows and an API page cannot exceed 100 rows. Sort columns are an allowlist, not raw arbitrary SQL input. The UI debounces text search rather than issuing a request on every keystroke.

## Step 5: Define authentication and the boundary between services

Angular signs in with Supabase's email/password SDK. The access token is attached as a bearer token to application API calls. Spring checks the token signature against Supabase's published JWKS, issuer, timestamps, and audience. The API additionally checks the email against `SUPABASE_ALLOWED_HR_EMAILS`; having any Supabase account does not automatically grant access to salary records.

The API allowlist is intentionally simple for a single-persona assessment. A larger deployment should use managed roles and explicit organization membership rather than environment-variable email addresses. The expected JWT signing keys are asymmetric (ES256 or RS256). A legacy HS256-only project needs a consciously selected verification strategy, not a shared secret copied into client code.

## Step 6: Keep browser database access denied

Both application tables have row-level security enabled and explicit deny policies for `anon` and `authenticated`. Spring connects using server-only database credentials and is responsible for all salary reads and writes. The publishable key is public client configuration; the database password and Supabase secret/service-role key are never embedded in the UI.

## Step 7: Keep salary updates explainable and concurrency-safe

A salary update includes the amount, currency, the version shown when the form was opened, and a reason. In a transaction, the backend locks and reads the current employee, compares versions, updates the current salary, and inserts an audit record. A stale edit gets a 409 conflict, and an unchanged amount/currency does not create fake history. Audit failure causes the transaction to roll back.

## Step 8: Generate believable but safe demo data

The seed script is set-based SQL using `generate_series`, so it creates all 10,000 records in one statement rather than 10,000 client requests. Employee numbers are deterministic and unique, addresses use the reserved `.test` domain, salaries are synthetic, and a unique employee number makes repeated runs idempotent. The script deliberately does not create authentication accounts.

The same schema and seed were applied to the connected assessment Supabase project. Verification returned 10,000 rows, 10 countries, and 10 departments. A second hardening migration adds browser-deny policies and fixes the trigger's search path. The Supabase security advisor returned no security lints afterward.

## Step 9: Build the views around the daily HR journey

- The login page provides sign in and account creation via Supabase.
- The dashboard exposes headcount status and currency-separated compensation summaries.
- The employee table exposes search, country/department/status filters, paging, and sortable fields.
- The employee page supports new employee creation and a reasoned salary update with recent history.
- The insights page groups compensation by currency, country, and department.

The visual system uses a left navigation rail, consistent panels, restrained purple accent, compact data tables, explicit loading/error/empty states, and responsive breakpoints. A component library was not necessary for this assessment; plain Angular templates and CSS keep the behavior easy to trace and avoid shipping a heavy UI runtime.

## Step 10: Use configuration appropriate to each deployment target

Local UI configuration points to the existing Supabase project and local API. Production Angular settings are generated at build time from `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `API_BASE_URL`; the script refuses missing or placeholder values. Vercel publishes the Angular browser bundle with a SPA rewrite. The API image runs on Java 21 and accepts deployment secrets from the host environment. `PORT` is honored for container platforms.

The Render blueprint is only a starting point: create the service in the user's own account, set the required secrets, add the final Vercel origin to CORS, and ensure the HR user's email appears in the allowlist. Free host availability, sleep behavior, and quotas can change, so current terms need to be checked immediately before deployment.

## Step 11: Add tests and CI without overstating verification

Backend unit tests cover page boundaries, filter validation, sort validation, request DTO validation, and problem-detail errors. Angular tests cover route-screen existence, model contract assumptions, and HTTP search parameters. A GitHub Actions workflow installs Java 21 and Node 22, runs backend tests, builds Angular using dummy public build configuration, and runs headless browser tests.

The generation environment used for this deliverable did not have Maven installed and could not reach the npm registry (DNS `EAI_AGAIN`), so those test/build commands could not be run here. The CI workflow is included for validation on the first GitHub push. Treat the first green CI run and a successful end-to-end staging smoke test as required acceptance gates, not as completed work.

## Step 12: Preserve the evolution in Git

The local history separates requirements, database and seed assets, backend/auth foundation, UI and deployment, and hardening. Commit titles describe the work completed and omit double-hyphen characters, as requested. The connected GitHub write API rejected initial content/blob writes with 403 and could not create a branch from the empty remote. For that reason the local committed repository is packaged with `.git` history, but the remote push remains a manual step from an authenticated Git client.

## What I would do next before calling it production-ready

1. Push the commit history to the assessment repository and inspect the actual CI result.
2. Verify JWT signing algorithm and claims against a test account from this exact Supabase project.
3. Deploy the Spring service, set the email allowlist and CORS origins, then deploy the Angular site.
4. Run a browser smoke test with a test user, one employee edit, audit verification, invalid token, stale edit, and invalid salary.
5. Add role/organization authorization if additional HR users or tenants are introduced. Add broader controller/integration/E2E tests before real salary data is used.
