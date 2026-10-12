# Deployment and Local Runbook

## Environments and ownership

- Angular builds as a static SPA and is hosted by Vercel.
- Spring Boot runs as a Docker service on Render; it requires Java 21 and reads `PORT` from the host environment.
- Supabase hosts Auth and PostgreSQL.
- Frontend public configuration is compiled at build time into `environment.prod.ts`; backend secrets belong only in Render environment settings or local ignored `.env`.

## Local prerequisites

- Node.js version compatible with Angular 20 (project README specifies Node 20.19+ or 22.12+), npm.
- JDK 21 and Maven 3.9+.
- Supabase project with email/password Auth enabled, migrations applied, and seeded employee data.

## Local backend

1. Copy `backend/.env.example` to `backend/.env` and fill values. Never commit `.env`.
2. `application.yml` imports `optional:file:.env[.properties]`, so run Maven from `backend/` for that local file import to resolve as expected.
3. For Supabase database connection, prefer the Supabase Session Pooler when direct IPv6 connectivity is unavailable. Use the exact host, port, and username displayed by Supabase.
4. JDBC URL must be JDBC format: `jdbc:postgresql://HOST:PORT/postgres?sslmode=require`. Do not put a full `postgresql://user:password@host` URI into `SPRING_DATASOURCE_URL`.
5. Run:

   ```bash
   cd backend
   mvn clean spring-boot:run
   ```

6. Confirm `http://localhost:8080/actuator/health` reports `{"status":"UP"}` and test the protected business API with a signed-in session.

## Local frontend

1. Ensure `frontend/src/environments/environment.ts` points to the intended Supabase project and local API.
2. Run:

   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Open `http://localhost:4200`.

## Vercel configuration

The latest deployment setup used Root Directory `frontend`; therefore commands are relative to `frontend`, and should not start with `cd frontend`.

- Framework: Angular.
- Install: `npm install --no-audit --no-fund` (or lockfile-deterministic `npm ci` once committed lockfile/platform setup is confirmed).
- Build: `npm run build`.
- Output: `dist/salary-management/browser`.
- SPA rewrite: `frontend/vercel.json` should route paths to `/index.html`, as used by Angular client-side routing.

Environment variables (Production):

- `SUPABASE_URL=https://<project-ref>.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY=<public publishable key from Supabase dashboard>`
- `API_BASE_URL=https://<render-service>.onrender.com/api`

The build script `frontend/scripts/write-production-environment.mjs` fails if required environment variables are missing or contain placeholder values. The publishable key is intended for browser use; database passwords and service-role keys are not.

## Render configuration

The repository includes `render.yaml` and `backend/Dockerfile`. The health check is `/actuator/health`.

Set these server variables in Render:

- `SPRING_DATASOURCE_URL`: JDBC Session Pooler URL with TLS.
- `SPRING_DATASOURCE_USERNAME`: exact pooler username from Supabase (often `postgres.<project-ref>`, but copy actual value).
- `SPRING_DATASOURCE_PASSWORD`: newly rotated database password.
- `SUPABASE_ISSUER_URI=https://<project-ref>.supabase.co/auth/v1`
- `SUPABASE_JWK_SET_URI=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`
- `SUPABASE_ALLOWED_HR_EMAILS`: comma-separated HR email allowlist.
- `APP_CORS_ALLOWED_ORIGINS`: exact Vercel origin(s), comma-separated as expected by the config.
- Optional `DB_POOL_SIZE=4` as a conservative starting value for a free instance, to be validated against provider/database limits.

**Important config review:** the tracked `render.yaml` currently sets `SPRING_DATASOURCE_USERNAME` to `postgres`, while a Session Pooler configuration often uses a project-qualified username. Ensure the Render value matches the connection mode and Supabase's displayed value. Do not assume the static YAML value is correct for pooler mode.

## Smoke test after deployment

1. Open the active production Vercel domain and verify `/` loads.
2. Refresh direct routes such as `/employees` and `/insights`.
3. Verify API health URL: `https://<render-service>.onrender.com/actuator/health`.
4. Sign in with a dedicated allowlisted demo HR account.
5. In browser DevTools, verify the dashboard request URL is exactly `https://<render-service>.onrender.com/api/dashboard/summary` and status is 200.
6. Verify employee search, filters and pagination work.
7. Create a synthetic employee, then edit salary with a reason and verify current value plus audit event.
8. Verify no token is sent to non-API domains and no salary table is queried directly from browser Supabase client.
9. Verify invalid/missing token gets 401; non-allowlisted account gets 403.
10. Check Render logs for DB errors and Vercel logs for production build output; do not paste secrets/tokens into issues or artifacts.

## Common failure diagnosis

| Symptom | First check |
|---|---|
| Vercel says `cd frontend: No such file or directory` | Root Directory is `frontend`; remove `cd frontend` from commands |
| Vercel homepage is 404 | Deployment URL/domain, output directory, presence of `dist/salary-management/browser/index.html` |
| Refresh of `/employees` is 404 | SPA rewrite `frontend/vercel.json` and active deployment includes it |
| Browser calls `/dashboard/summary` and returns 404/500 | `API_BASE_URL` missing `/api`; the Spring controller mapping includes `/api` |
| Browser gets CORS error | Exact origin in `APP_CORS_ALLOWED_ORIGINS`; CORS is not a substitute for auth |
| API returns 401 | Token attached? issuer, audience, time, JWKS signing algorithm/config correct? |
| API returns 403 | Authenticated email is included exactly in `SUPABASE_ALLOWED_HR_EMAILS` (case-insensitive match in app) |
| `Driver org.postgresql.Driver claims to not accept jdbcUrl` | `SPRING_DATASOURCE_URL` must start `jdbc:postgresql://`, not `postgresql://` |
| Hikari connection timeout / DNS issue | Verify pooler host/port, network, TLS, pooler username, password, and service DB reachability |
| `password authentication failed` | Rotate/set database password, update Render secret, restart/redeploy |
| Local JDK error `release version 21 not supported` | `mvn -version` must show JDK 21; align `JAVA_HOME` and Maven runtime |

## Free-tier note

Render free web services can sleep after inactivity and wake slowly. Treat cold-start delays separately from correctness failures. Free-tier availability, quotas, and pricing can change; check current provider terms before relying on the service for anything beyond an assessment demo.
