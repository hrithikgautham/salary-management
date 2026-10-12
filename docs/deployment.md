# Deployment guide

Deployment provider pricing and free plans change. Check each provider's current terms before choosing it. A free instance may sleep, limit hours/requests, or be unsuitable for sensitive production employee data. Do not use this assessment deployment for real payroll or sensitive employee information.

## 1. Prepare Supabase

1. Open project `salary-management` in your Supabase dashboard.
2. Go to SQL Editor and run `infra/supabase/migrations/001_initial_schema.sql`.
3. Review `infra/scripts/seed-employees.sql`, then run it to add 10,000 synthetic employees. Confirm with `select count(*) from public.employees;`.
4. Under Authentication settings, enable Email provider and configure confirmation emails.
5. Under URL Configuration, add your local UI URL and deployed Vercel URL to Site URL / Redirect URLs.
6. In JWT settings, use an asymmetric signing key so the API can validate tokens using the published JWKS endpoint. Do not put a service-role key or database password in the browser.
7. Copy the database connection string/password from Supabase Database settings to the backend hosting provider's server-only environment variables. Require SSL.

## 2. Deploy Angular on Vercel

1. Import `hrithikgautham/salary-management` from GitHub to Vercel.
2. The repo includes `vercel.json`; if the build settings are requested manually, the build command is `cd frontend && npm ci && npm run build` and output directory is `frontend/dist/salary-management/browser`.
3. Vercel serves a static Angular SPA; `vercel.json` rewrites client routes to `index.html`.
4. Copy `frontend/src/environments/environment.example.ts` to `frontend/src/environments/environment.ts` locally only, with your project URL, Supabase publishable key, and API base URL before building. For a clean reproducible production setup, convert the Angular environment to a build-time replacement driven by Vercel environment variables; never expose server-only secrets.
5. Add the deployed Vercel origin to `APP_CORS_ALLOWED_ORIGINS` on the API. Also include `http://localhost:4200` only for local development.
6. Deploy, then test refreshes on `/employees`, sign-in, invalid token behavior, and API CORS from the hosted origin.

## 3. Free or low-cost Spring Boot hosting options

### Option A: Render free web service (Docker)

The repository includes `backend/Dockerfile` and `render.yaml` as a starting point. Create a Web Service from the GitHub repository and select Docker. In the Render service dashboard set these secrets/environment variables:

- `SPRING_DATASOURCE_URL`: Supabase Postgres JDBC URL with `sslmode=require`.
- `SPRING_DATASOURCE_USERNAME`: usually `postgres` or your dedicated database role.
- `SPRING_DATASOURCE_PASSWORD`: database password, stored as a secret.
- `SUPABASE_ISSUER_URI`: `https://<project-ref>.supabase.co/auth/v1`.
- `APP_CORS_ALLOWED_ORIGINS`: exact Vercel domain, optionally plus localhost for local development.
- `SERVER_PORT`: usually supplied by the provider; this app defaults to 8080. If the platform supplies `PORT`, set `SERVER_PORT` to that value or change the app configuration to honor `PORT`.

Free availability/limits can change. Review the current Render plan. The free service may spin down when idle, so the first request after idle can be slow. Once deployed, open `/actuator/health` and confirm the database is reachable.

### Option B: Other Java-capable hosts

Any provider that can run a Docker image or Java 21 process will work. Deploy `backend/Dockerfile`, map its HTTP port, and configure the same environment variables. Check current free-tier eligibility and sleep/usage restrictions directly with the provider before relying on it for the demo.

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
