# ACME Salary Management

A full-stack salary administration tool for an HR manager operating across countries. Angular provides the web interface, Spring Boot provides the business API, and Supabase provides PostgreSQL plus email/password authentication.

## What is included

- Email/password sign in and sign up through Supabase Auth.
- Spring Security validates the Supabase access token on every protected API request using Supabase's JWKS endpoint (asymmetric JWT signing keys).
- Employee directory with server-side filtering, sorting, and pagination.
- Create and edit employee salary records, with optimistic concurrency and a salary audit trail.
- Dashboard KPIs and insights grouped by country, department, and currency. Values in different currencies are deliberately not summed together.
- SQL migration, repeatable 10,000-record seed script, backend unit/integration tests, and deployment instructions.

## Repository layout

- `frontend/`: Angular application, served as a static SPA on Vercel.
- `backend/`: Spring Boot REST API, deployed separately.
- `infra/supabase/migrations/`: reviewed SQL migration for Supabase Postgres.
- `infra/scripts/seed-employees.sql`: deterministic 10,000-employee synthetic data seed.
- `docs/`: requirements, architecture, decisions, AI workflow, demo checklist, and deployment guide.

## Prerequisites

- Node.js 20.19+ or 22.12+, npm.
- Java 21.
- Maven 3.9+ (or use the included Maven wrapper after generating it with `mvn wrapper:wrapper`).
- Supabase project with email/password provider enabled.

## Local setup

1. In Supabase SQL Editor, run `infra/supabase/migrations/001_initial_schema.sql`.
2. In SQL Editor, run `infra/scripts/seed-employees.sql` to insert 10,000 deterministic synthetic employees. The script is idempotent by `employee_number`.
3. Copy `backend/.env.example` to `backend/.env` and fill in your local environment. Do not commit secrets.
4. Start the API from `backend/` with `./mvnw spring-boot:run` (or `mvn spring-boot:run` if Maven is installed).
5. Copy `frontend/src/environments/environment.example.ts` to `frontend/src/environments/environment.ts` and fill in Supabase URL, publishable key, and API base URL.
6. From `frontend/`, run `npm install` then `npm start` and open `http://localhost:4200`.

Supabase's publishable key is intended for browser use. Never place a Supabase secret/service-role key in Angular, Vercel client environment variables, or a Git repository. Salary data access goes through Spring Boot; database credentials remain server-only.

## Tests

- Backend: `cd backend && ./mvnw test`.
- Frontend: `cd frontend && npm test -- --watch=false`.

## Production readiness notes

This repository contains deployable application code and deployment instructions, but the live Angular site and Spring service are not deployed from this workspace. You must configure deployment providers and secrets in your own accounts. Supabase authentication email confirmation, allowed redirect URLs, CORS origins, and backend environment variables must be configured before production use. Demo data is synthetic and the app is an assessment prototype, not a payroll ledger.
