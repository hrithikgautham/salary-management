# ACME Salary Management

A full-stack salary administration tool for an HR manager operating across countries. Angular provides the web interface, Spring Boot provides the business API, and Supabase provides PostgreSQL plus email/password authentication.

## What is included

- Email/password sign in and sign up through Supabase Auth.
- Spring Security validates the Supabase access token on every protected API request using Supabase's JWKS endpoint (asymmetric JWT signing keys).
- Employee directory with server-side filtering, sorting, and pagination.
- Create and edit employee salary records, with optimistic concurrency and a salary audit trail.
- Dashboard KPIs and insights grouped by country, department, and currency. Values in different currencies are deliberately not summed together.
- SQL migrations, a repeatable 10,000-record seed script, fast backend/frontend tests, and deployment instructions.

## Repository layout

- `frontend/`: Angular application, served as a static SPA on Vercel.
- `backend/`: Spring Boot REST API, deployed separately.
- `infra/supabase/migrations/`: reviewed SQL migration for Supabase Postgres.
- `infra/scripts/seed-employees.sql`: deterministic 10,000-employee synthetic data seed.
- `docs/`: requirements, architecture, decisions, AI workflow, demo checklist, and deployment guide.

## Prerequisites

- Node.js 20.19+ or 22.12+, npm.
- Java 21.
- Maven 3.9+.
- Supabase project with email/password provider enabled.

## Local setup

1. In Supabase SQL Editor, run `infra/supabase/migrations/001_initial_schema.sql`, then `infra/supabase/migrations/002_lock_down_browser_data_access.sql`.
2. In SQL Editor, run `infra/scripts/seed-employees.sql` to insert 10,000 deterministic synthetic employees. The script is idempotent by `employee_number`.
3. Copy `backend/.env.example` to `backend/.env` and fill in your local database password and approved HR email. Spring Boot imports this local properties file; `.env` is git-ignored. Do not commit secrets.
4. Start the API from `backend/` with `mvn spring-boot:run`.
5. `frontend/src/environments/environment.ts` is preconfigured with this project’s public Supabase URL and publishable key and the local API URL. For production, set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `API_BASE_URL` in Vercel so the build generates the production environment file.
6. From `frontend/`, run `npm install` then `npm start` and open `http://localhost:4200`.

Supabase's publishable key is intentionally public and may be included in Angular. Never place a Supabase secret/service-role key, database password, or user token in browser code or a Git repository. Salary data access goes through Spring Boot; access is guarded by verified JWTs, an HR email allowlist, and database policies.

## Tests

- Backend: `cd backend && mvn test`.
- Frontend: `cd frontend && npm test -- --watch=false`.

## Production readiness notes

This repository contains deployable application code and deployment instructions, but the live Angular site and Spring service are not deployed from this workspace. You must configure deployment providers and secrets in your own accounts. Supabase authentication email confirmation, allowed redirect URLs, CORS origins, and backend environment variables must be configured before production use. Demo data is synthetic and the app is an assessment prototype, not a payroll ledger.
