# Deployment guide

Deployment provider pricing and free plans change. Check each provider's current terms before choosing it. A free instance may sleep, limit hours/requests, or be unsuitable for sensitive production employee data. Do not use this assessment deployment for real payroll or sensitive employee information.

## 1. Prepare Supabase

1. Open project `salary-management` in your Supabase dashboard.
2. Go to SQL Editor and run `infra/supabase/migrations/001_initial_schema.sql`.
3. Run `infra/supabase/migrations/002_lock_down_browser_data_access.sql` to install explicit browser-deny policies and harden the trigger function.
4. Review `infra/scripts/seed-employees.sql`, then run it to add 10,000 synthetic employees. Confirm with `select count(*) from public.employees;`.
5. Under Authentication settings, enable Email provider and configure confirmation emails.
6. Under URL Configuration, add your local UI URL and deployed Vercel URL to Site URL / Redirect URLs.
7. In JWT settings, use an asymmetric signing key so the API can validate tokens using the published JWKS endpoint. Confirm `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json` works for the active signing key. Do not put a service-role key or database password in the browser.
8. Copy the database connection string/password from Supabase Database settings to the backend hosting provider's server-only environment variables. Require SSL.

## 2. Deploy Angular on Vercel

1. Import `hrithikgautham/salary-management` from GitHub to Vercel.
2. The repo includes `vercel.json`; if the build settings are requested manually, the build command is `cd frontend && npm run build` (Vercel runs the install command separately) and output directory is `frontend/dist/salary-management/browser`.
3. Vercel serves a static Angular SPA; `vercel.json` rewrites client routes to `index.html`.
4. For local development, `frontend/src/environments/environment.ts` is already set to this project URL, publishable key, and local API base URL. For Vercel production, add `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `API_BASE_URL` as build environment variables. The build script generates `environment.prod.ts` and refuses to build if values are missing or still placeholders. Never expose server-only secrets.
5. Add the deployed Vercel origin to `APP_CORS_ALLOWED_ORIGINS` on the API. Also include `http://localhost:4200` only for local development.
6. Deploy, then test refreshes on `/employees`, sign-in, invalid token behavior, and API CORS from the hosted origin.

## 3. Free or low-cost Spring Boot hosting options

### Option A: Render free web service (Docker)

The repository includes `backend/Dockerfile` and `render.yaml` as a starting point. Create a Web Service from the GitHub repository and select Docker. In the Render service dashboard set these secrets/environment variables:

- `SPRING_DATASOURCE_URL`: Supabase Postgres JDBC URL with `sslmode=require`.
- `SPRING_DATASOURCE_USERNAME`: usually `postgres` or your dedicated database role.
- `SPRING_DATASOURCE_PASSWORD`: database password, stored as a secret.
- `SUPABASE_ISSUER_URI`: `https://<project-ref>.supabase.co/auth/v1`.
- `SUPABASE_JWK_SET_URI`: `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`.
- `SUPABASE_ALLOWED_HR_EMAILS`: comma-separated exact email addresses of approved HR operators. The API denies HR access if the allowlist is empty.
- `APP_CORS_ALLOWED_ORIGINS`: exact Vercel domain, optionally plus localhost for local development.
- `PORT` is honored automatically when supplied by the platform. Locally, the API defaults to port 8080.

Free availability/limits can change. Review the current Render plan. Render currently documents that a free web service spins down after 15 minutes without inbound traffic and can take about one minute to wake; this makes it suitable for an assessment demo but not a production HR system. See [Render free instance limitations](https://render.com/docs/free). Once deployed, open `/actuator/health` and confirm the database is reachable.

### Option B: Other Java-capable hosts

Any provider that can run a Docker image or Java 21 process will work. Deploy `backend/Dockerfile`, map its HTTP port, and configure the same environment variables. Check current free-tier eligibility and sleep/usage restrictions directly with the provider before relying on it for the demo. Free-tier availability, usage caps, and acceptable-use rules change; Render itself labels free web services as suitable for testing and hobby projects rather than production.

### Avoiding database connection mistakes

- Use Supabase's direct or pooler URI as appropriate for the host's network support and configured connection count.
- Do not use the Supabase transaction pooler for long-lived prepared statements without checking its current recommendations.
- Keep JDBC pool small for a free host (`DB_POOL_SIZE=4` or `8`) and verify total connections are under Supabase's limit.
- Use TLS (`sslmode=require`). Store credentials only in the host's encrypted environment/secrets UI.

## 4. Local end-to-end smoke test

1. Start backend with its environment configured.
2. Start frontend with environment URL, publishable key, and API endpoint.
3. Sign up with a test email and confirm it if email confirmation is enabled.
4. Log in, load dashboard, search `ACME-00001`, open the employee, update salary with a reason, and verify audit history appears.
5. In a private window, call `/api/employees` without an access token and confirm HTTP 401. Call it with an invalid token and confirm HTTP 401.
6. Try an unsupported page size (`size=1000`) and a negative salary update. Confirm API errors, not silent client-only blocking.

## 5. Short video demo

Record a 3 to 5 minute screen capture: login, dashboard currency caveat, employee search, employee profile, salary update and audit record, insights grouped by currency, and architecture/requirements docs. Use fake credentials and synthetic employee data. Never record the browser's developer console if it might show access tokens or copy environment settings into the recording.
