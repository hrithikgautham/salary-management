# Readiness and Open Issues (Evidence-Based Snapshot)

**Snapshot date:** 13 October 2026 (local session context). Update this document after the next deployment/smoke test.

## Evidence seen so far

| Component | Evidence | Status |
|---|---|---|
| Supabase schema | `employees` and `salary_audit` exist; RLS is enabled; columns/constraints/indexes observed through project inspection | Present |
| Seed data | A SQL count/uniqueness check returned 10,000 seeded `ACME-xxxxx` records; the seeded rows had 10,000 distinct full names after a direct live-data update | Present, but repeatable script should be aligned |
| Additional test row | Supabase table had 10,001 rows total because one non-seed employee record remained alongside the 10,000 seed rows | Needs deliberate demo-data choice |
| Backend local startup | Spring Boot started with Java 21 in local logs | Process startup verified; all endpoints not thereby proven |
| Render API deployment | Render log screenshot shows deployment succeeded and service URL reported live; Tomcat started on a port | Service startup verified |
| Vercel frontend deployment | Vercel deployment detail showed status Ready and a rendered login-screen preview | Static deploy observed |
| Dashboard end-to-end | Browser screenshot showed HTTP 500 for a dashboard request to `/dashboard/summary` (without `/api`) | **Not verified / failing at snapshot** |
| Automated tests | Unit tests exist and CI workflow is committed; no green run evidence in the captured material | Run and record results |
| Demo video | Script exists in project docs; no completed video link provided in available evidence | Not yet evidenced |

## Highest-priority issues

### P0 — Protect exposed credentials

A database password appeared in a screenshot/log and an uploaded `.zip` included `backend/.env`. Assume it is compromised. Rotate it in Supabase, update Render/local settings, inspect Git history, and do not add `.env` or screenshots with credentials to the final submission. A bearer token also appeared in a screenshot; sign out/revoke if supported and let any exposed access token expire.

### P1 — Fix the production API base path

Source endpoint mapping is `/api/dashboard/summary`. `ApiService.dashboard()` appends `/dashboard/summary` to `environment.apiBaseUrl`. The captured production request URL was `/dashboard/summary`, which strongly suggests the Vercel `API_BASE_URL` did not include `/api`. Set it to `https://<render-service>.onrender.com/api`, redeploy the Vercel build, and confirm the exact browser URL returns 200.

### P1 — Confirm database configuration on Render

Use JDBC URL format and match the active Supabase connection method:

`jdbc:postgresql://<session-pooler-host>:<port>/postgres?sslmode=require`

Set the exact pooler username/password in Render. `render.yaml` currently hardcodes username `postgres`; check whether that value overrides the project-qualified pooler username. Validate `/actuator/health` first, then dashboard endpoint and logs.

### P1 — Verify actual end-to-end workflows

A green Render deployment only proves startup/health check, not that the dashboard query succeeds. Test dashboard, directory, create, salary update, audit history, negative salary, stale version, 401, and 403 with the real deployment.

### P2 — Align the seed artifact with the live demo data

The checked-in original seed has a 40-name first/last pool and may repeat full names. The live seed rows were separately updated to distinct names. To reproduce that characteristic in future clean environments, review/adopt `implementation-assets/seed-employees-unique-names.sql`. Because the seed uses `ON CONFLICT DO NOTHING`, rerunning it against existing IDs will not rename existing rows.

## Ready-to-submit criteria

- [ ] Database password and exposed token have been handled; no secrets in Git/archive.
- [ ] Vercel root directory, build/output commands, and SPA rewrite are correct.
- [ ] `API_BASE_URL` ends with `/api` and production bundle has been rebuilt after env changes.
- [ ] Render uses valid JDBC URL and verified pooler username/password.
- [ ] API health and dashboard both succeed.
- [ ] Login, search/filter/page, create, salary update and audit are smoke-tested.
- [ ] Automated CI is green and results are recorded.
- [ ] Git history and diff contain meaningful incremental commits and no accidental generated/secret files.
- [ ] Demo video link has been uploaded and opens for reviewers.
- [ ] Final email includes repo URL and demo link as requested by the assessment.

## How to update this record

Add date/time, environment, exact endpoint (without credentials), status code, and test result. If a test fails, preserve the failing symptom and root cause, then update only after the fix is observed. Never paste tokens or passwords into this file.
